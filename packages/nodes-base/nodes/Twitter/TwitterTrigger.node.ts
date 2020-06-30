import {
	IHookFunctions,
	IWebhookFunctions,
  } from 'n8n-core';

  import {
	IDataObject,
	INodeTypeDescription,
	INodeType,
	IWebhookResponseData,
  } from 'n8n-workflow';

  import {
	twitterApiRequest,
	getAccessToken,
	genericRequest,
 } from './GenericFunctions';

import {
	createHmac,
 } from 'crypto';

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
				name: 'setup',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: 'webhook',
			},
			{
				name: 'default',
				httpMethod: 'POST',
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
					// TODO add all events
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

				const { access_token } = await getAccessToken.call(this);

				const webhookData = this.getWorkflowStaticData('node');

				const credentials = this.getCredentials('twitterOAuth1Api');

				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				const endpoint = `/account_activity/all/${credentials?.env}/webhooks.json`;

				const webhooks = await genericRequest.call(this, 'GET', endpoint, {}, {}, undefined, { headers: { 'Authorization': `Bearer ${access_token}` } });

				for (const webhook of webhooks) {
					if (webhook.url === webhookUrl && webhook.valid) {
						webhookData.webhookId = webhook.id;
						return true;
					}
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');

				const webhookData = this.getWorkflowStaticData('node');

				const credentials = this.getCredentials('twitterOAuth1Api');

				const method = 'POST';

				const form = {
					url: webhookUrl,
				};
				let endpoint = `/account_activity/all/${credentials?.env}/webhooks.json`;

				const webhook = await twitterApiRequest.call(this, method, endpoint, form);

				if (webhook.id === undefined) {
					return false;
				}

				endpoint = `/account_activity/all/${credentials?.env}/subscriptions.json`;

				const subscription = await twitterApiRequest.call(this, method, endpoint, form);

				webhookData.webhookId = webhook.id as string;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const credentials = this.getCredentials('twitterOAuth1Api');

				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {

					const { access_token } = await getAccessToken.call(this);

					const endpoint = `/account_activity/all/${credentials?.env}/webhooks/${webhookData.webhookId}.json`;

					try {
						await genericRequest.call(this, 'DELETE', endpoint, {}, {}, undefined, { headers: { 'Authorization': `Bearer ${access_token}` } });
					} catch (e) {
						if (e.statusCode === 404) {
							delete webhookData.webhookId;
						}
						return false;
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const queryData = this.getQueryData() as IDataObject;
		const req = this.getRequestObject();

		const credentials = this.getCredentials('twitterOAuth1Api');

		if (this.getWebhookName() === 'setup') {

			const responseToken = createHmac('sha256', credentials?.consumerSecret as string).update(queryData.crc_token as string).digest('base64');

			const res = this.getResponseObject();

			res.status(200).json({
				response_token: `sha256=${responseToken}`,
			 });

			return {
				noWebhookResponse: true,
			};
		}

		//TODO

		// validate signature from webhooks

		// filter events

		return {
			workflowData: [
				this.helpers.returnJsonArray(req.body)
			],
		};
	}
}
