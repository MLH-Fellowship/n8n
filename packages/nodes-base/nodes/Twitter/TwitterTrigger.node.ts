import {
	IHookFunctions,
	IWebhookFunctions,
  } from 'n8n-core';

  import {
	IDataObject,
	INodeTypeDescription,
	INodeType,
	IWebhookResponseData,
	ILoadOptionsFunctions,
	INodePropertyOptions,
  } from 'n8n-workflow';

  import {
	twitterApiRequest,
	twitterWebhookRequest
 } from './GenericFunctions';

 const crypto = require('crypto');


export class TwitterTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Twitter Trigger',
		name: 'twitterTrigger',
		icon: 'file:twitter.png',
		group: ['trigger'],
		version: 1,
		description: 'Consume Twitter API',
		subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
		defaults: {
			name: 'Twitter Trigger',
			color: '#1DA1F2',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'twitterOAuth1Api',
				required: true,
			}
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
			{
				name: 'setup',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'The events that can trigger the webhook and whether they are enabled.',
				options: [
					{
						name: 'Liked Tweet',
						value: 'likedTweet',
						description: 'Triggers when a user likes a tweet.',
					},
					{
						name: 'New Follower',
						value: 'newFollower',
						description: 'Triggers when a specific user gets a new follower.',
					},
					{
						name: 'My Tweet',
						value: 'myTweet',
						description: `Triggers when you tweet.`,
					},
					{
						name: 'Search Mention',
						value: 'searchMention',
						description: `Triggers when a user tweets containing specific search terms`,
					},
					{
						name: 'User Tweet',
						value: 'userTweet',
						description: `Whether the webhook is triggered when a subscriber's email address is changed.`,
					},
				],
			},
		],
	};

// @ts-ignore (because of request)
webhookMethods = {
	default: {
		async checkExists(this: IHookFunctions): Promise<boolean> {
			// console.log("checkExists---------------------------------")
			// const options = {
			// 	url: 'https://api.twitter.com/1.1/account_activity/all/' + 'testing' + '/webhooks.json',
			// 	oauth: {
			// 		consumer_key: 'x6fezM3f4MxxdtAtRxqf9xM1v',
			// 		consumer_secret: 'UexyCAOgzwWA25z5Hj8nongm3xAKTLRh3bM0iNv9XMj8hJM2IR',
			// 		token: '1222387514243239936-Ocdpv3kkUoxExc3k6x4dHYiBmNgLvh',
			// 		token_secret: 'VciXE6HFKochwKZJkndPGnW1zqoCXYBUeI50qQcPoFx6R'
			// 	},
			// };
			// const endpoint = '/account_activity/all/' + 'testing' + '/webhooks.json';
			// try {
			// 	console.log("options---------------------------------")
			// 	console.log(options);
			// 	const trial = await twitterApiRequest.call(this, 'GET', endpoint, options);
			// 	console.log(trial);
			// } catch (err) {
			// 	if (err.statusCode === 404) {
			// 		return false;
			// 	}
			// 	throw new Error(`Twitter Error: ${err}`);
			// }
			// return true;
			return false;
		},

		async create(this: IHookFunctions): Promise<boolean> {
			let webhook;
			const webhookUrl = this.getNodeWebhookUrl('default');
			const events = this.getNodeParameter('events', []) as string[];
			// request options
			const method = 'POST';
			const oauth = {
				consumer_key: 'x6fezM3f4MxxdtAtRxqf9xM1v',
				consumer_secret: 'UexyCAOgzwWA25z5Hj8nongm3xAKTLRh3bM0iNv9XMj8hJM2IR',
				token: '1222387514243239936-Ocdpv3kkUoxExc3k6x4dHYiBmNgLvh',
				token_secret: 'VciXE6HFKochwKZJkndPGnW1zqoCXYBUeI50qQcPoFx6R',
			};
			const form = {
				url: webhookUrl,
			};
			const endpoint = '/account_activity/all/testing/webhooks.json';
			try {
				console.log(endpoint);
				webhook = await twitterWebhookRequest.call(this, method, endpoint, {}, {}, oauth, form);
				console.log(webhook);
			} catch (e) {
				console.log("here is the error");
				throw e;
			}
			if (webhook.id === undefined) {
				return false;
			}
			const webhookData = this.getWorkflowStaticData('node');
			webhookData.webhookId = webhook.id as string;
			webhookData.events = events;
			return true;
		},

		async delete(this: IHookFunctions): Promise<boolean> {
			// const webhookData = this.getWorkflowStaticData('node');
			// if (webhookData.webhookId !== undefined) {
			// 	const endpoint = ` /webhooks`;
			// 	try {
			// 		await twitterApiRequest.call(this, 'DELETE', endpoint, {});
			// 	} catch (e) {
			// 		return false;
			// 	}
			// 	delete webhookData.webhookId;
			// 	delete webhookData.events;
			// 	delete webhookData.sources;
			// }
			return true;
		},
	},
};

async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
	const bodyData = this.getBodyData() as IDataObject;
	const headerData = this.getHeaderData() as IDataObject;
	const queryData = this.getQueryData() as IDataObject;
	const req = this.getRequestObject();

	const webhookData = this.getWorkflowStaticData('node') as IDataObject;

	console.log(headerData);
	console.log(queryData);


	if (queryData['crc-token'] !== undefined) {
		// Is a create webhook confirmation request
		webhookData.crc = queryData['crc-token'];

		console.log(webhookData.crc);

		webhookData.crc = crypto.createHmac('sha256', 'UexyCAOgzwWA25z5Hj8nongm3xAKTLRh3bM0iNv9XMj8hJM2IR').update(webhookData.crc).digest('base64');

		const res = this.getResponseObject();
		res.set('response-token', webhookData.crc as string);
		res.status(200).end();
		return {
			noWebhookResponse: true,
		};
	}

	// if (webhookName === 'setup') {
	// 	// Is a create webhook confirmation request
	// 	const res = this.getResponseObject();
	// 	res.status(200).end();
	// 	return {
	// 		noWebhookResponse: true,
	// 	};
	// }
	// const req = this.getRequestObject();
	// if (req.body.id !== webhookData.id) {
	// 	return {};
	// }
	// @ts-ignore
	if (!webhookData.events.includes(req.body.type)
	// @ts-ignore
	&& !webhookData.sources.includes(req.body.type)) {
		return {};
	}
	return {
		workflowData: [
			this.helpers.returnJsonArray(req.body)
		],
	};
}
}
