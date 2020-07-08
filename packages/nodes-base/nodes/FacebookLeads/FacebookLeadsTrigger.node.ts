import {
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-core';
import {
	INodeTypeDescription,
	INodeType,
	IDataObject,
	IWebhookResponseData,
} from 'n8n-workflow';
import {
	facebookLeadsApiRequest,
} from './GenericFunctions';

export class FacebookLeadsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Leads Trigger',
		name: 'facebookLeads',
		group: ['trigger'],
		//icon: 'file:customer.Io.png',
		version: 1,
		description: 'Starts the workflow on a Facebook Leads update.',
		defaults: {
			name: 'FacebookLeads Trigger',
			color: '#00FF00',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'facebookLeadsApi',
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
			// {
			// 	displayName: 'Events',
			// 	name: 'events',
			// 	type: 'multiOptions',
			// 	default: [],
			// 	description: 'The events that can trigger the webhook and whether they are enabled.',
			// 	options: [
			// 		{
			// 			name: 'Customer Subscribed',
			// 			value: 'customer.subscribed',
			// 			description: 'Whether the webhook is triggered when a customer is subscribed.',
			// 		},
			// 		{
			// 			name: 'Customer Unsubscribed',
			// 			value: 'customer.unsubscribed',
			// 			description: 'Whether the webhook is triggered when a customer is unsubscribed.',
			// 		},
			// 		{
			// 			name: 'Email Attempted',
			// 			value: 'email.attempted',
			// 			description: 'Whether the webhook is triggered when a email is attempted.',
			// 		},
			// 		{
			// 			name: 'Email Bounced',
			// 			value: 'email.bounced',
			// 			description: 'Whether the webhook is triggered when a email is bounced.',
			// 		},
			// 		{
			// 			name: 'Email Clicked',
			// 			value: 'email.clicked',
			// 			description: 'Whether the webhook is triggered when a email is clicked.',
			// 		},
			// 		{
			// 			name: 'Email Converted',
			// 			value: 'email.converted',
			// 			description: 'Whether the webhook is triggered when a email is converted.',
			// 		},
			// 		{
			// 			name: 'Email Delivered',
			// 			value: 'email.delivered',
			// 			description: 'Whether the webhook is triggered when a email is delivered.',
			// 		},
			// 		{
			// 			name: 'Email Drafted',
			// 			value: 'email.drafted',
			// 			description: 'Whether the webhook is triggered when a email is drafted.',
			// 		},
			// 		{
			// 			name: 'Email Failed',
			// 			value: 'email.failed',
			// 			description: 'Whether the webhook is triggered when a email is failed.',
			// 		},
			// 		{
			// 			name: 'Email Opened',
			// 			value: 'email.opened',
			// 			description: 'Whether the webhook is triggered when a email is opened.',
			// 		},
			// 		{
			// 			name: 'Email Sent',
			// 			value: 'email.sent',
			// 			description: 'Whether the webhook is triggered when a email is sent.',
			// 		},
			// 		{
			// 			name: 'Email Spammed',
			// 			value: 'email.spammed',
			// 			description: 'Whether the webhook is triggered when a email is spammed.',
			// 		},
			// 		{
			// 			name: 'Push Attempted',
			// 			value: 'push.attempted',
			// 			description: 'Whether the webhook is triggered when a push is attempted.',
			// 		},
			// 		{
			// 			name: 'Push Bounced',
			// 			value: 'push.bounced',
			// 			description: 'Whether the webhook is triggered when a push is bounced.',
			// 		},
			// 		{
			// 			name: 'Push Clicked',
			// 			value: 'push.clicked',
			// 			description: 'Whether the webhook is triggered when a push is clicked.',
			// 		},
			// 		{
			// 			name: 'Push Delivered',
			// 			value: 'push.delivered',
			// 			description: 'Whether the webhook is triggered when a push is delievered.',
			// 		},
			// 		{
			// 			name: 'Push Drafted',
			// 			value: 'push.drafted',
			// 			description: 'Whether the webhook is triggered when a push is drafted.',
			// 		},
			// 		{
			// 			name: 'Push Failed',
			// 			value: 'push.failed',
			// 			description: 'Whether the webhook is triggered when a push is failed.',
			// 		},
			// 		{
			// 			name: 'Push Opened',
			// 			value: 'push.opened',
			// 			description: 'Whether the webhook is triggered when a push is opened.',
			// 		},
			// 		{
			// 			name: 'Push Sent',
			// 			value: 'push.sent',
			// 			description: 'Whether the webhook is triggered when a push is sent.',
			// 		},
			// 		{
			// 			name: 'Slack Attempted',
			// 			value: 'slack.attempted',
			// 			description: 'Whether the webhook is triggered when a slack message is attempted.',
			// 		},
			// 		{
			// 			name: 'Slack Clicked',
			// 			value: 'slack.clicked',
			// 			description: 'Whether the webhook is triggered when a slack message is clicked.',
			// 		},
			// 		{
			// 			name: 'Slack Drafted',
			// 			value: 'slack.drafted',
			// 			description: 'Whether the webhook is triggered when a slack message is drafted.',
			// 		},
			// 		{
			// 			name: 'Slack Failed',
			// 			value: 'slack.failed',
			// 			description: 'Whether the webhook is triggered when a slack message is failed.',
			// 		},
			// 		{
			// 			name: 'Slack Sent',
			// 			value: 'slack.sent',
			// 			description: 'Whether the webhook is triggered when a slack message is sent.',
			// 		},
			// 		{
			// 			name: 'SMS Attempted',
			// 			value: 'slack.attempted',
			// 			description: 'Whether the webhook is triggered when a SMS is attempted.',
			// 		},
			// 		{
			// 			name: 'SMS Bounced',
			// 			value: 'slack.bounced',
			// 			description: 'Whether the webhook is triggered when a SMS is attempted.',
			// 		},
			// 		{
			// 			name: 'SMS Clicked',
			// 			value: 'slack.clicked',
			// 			description: 'Whether the webhook is triggered when a SMS is clicked.',
			// 		},
			// 		{
			// 			name: 'SMS Delivered',
			// 			value: 'slack.delivered',
			// 			description: 'Whether the webhook is triggered when a SMS is delivered.',
			// 		},
			// 		{
			// 			name: 'SMS Drafted',
			// 			value: 'slack.drafted',
			// 			description: 'Whether the webhook is triggered when a SMS is drafted.',
			// 		},
			// 		{
			// 			name: 'SMS Failed',
			// 			value: 'slack.failed',
			// 			description: 'Whether the webhook is triggered when a SMS is failed.',
			// 		},
			// 		{
			// 			name: 'SMS Sent',
			// 			value: 'slack.sent',
			// 			description: 'Whether the webhook is triggered when a SMS is sent.',
			// 		},

			// 	],
			// },
		],
	};
	// @ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId === undefined) {
					// No webhook id is set so no webhook can exist
					return false;
				}
				//const endpoint = `/reporting_webhooks/${webhookData.webhookId}`;
				try {
					//await facebookLeadsApiRequest.call(this, 'GET', endpoint, {}, {});
				} catch (error) {
					if (error.statusCode === 404) {
						return false;
					}
					throw new Error(`Facebook Leads Error: ${error}`);
				}

				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				let webhook;
				const webhookUrl = this.getNodeWebhookUrl('default');
				const credentials = this.getCredentials('facebookLeadsApi');
				const endpoint = `/${credentials?.appId}/subscriptions`;
				//https://graph.facebook.com/{page-id}/subscribed_apps
				const body = {
					endpoint: webhookUrl,
					subscribed_fields: 'leadgen',


				};

				try {
					webhook = await facebookLeadsApiRequest.call(this, 'POST', endpoint, body, {});
				} catch (error) {
					throw error;
				}

				if (webhook.id === undefined) {
					return false;
				}
				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = webhook.id as string;
				//webhookData.events = eventsList;
				return true;

			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const credentials = this.getCredentials('facebookLeadsApi');
				if (webhookData.webhookId !== undefined) {
					const endpoint = `/${credentials?.appId}/subscriptions`;
					try {
						await facebookLeadsApiRequest.call(this, 'DELETE', endpoint, {}, {});
					} catch (error) {
						return false;
					}
					delete webhookData.webhookId;
					//delete webhookData.events;

				}
				return true;
			},
		}
	};



	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const req = this.getRequestObject();
		const queryData = this.getQueryData() as IDataObject;
		const credentials = this.getCredentials('facebookLeadsApi');

		if (this.getWebhookName() === 'setup') {

			const res = this.getResponseObject();

			res.status(200).json({
				hub_challenge: queryData.hub_challenge,
			});

			return {
				noWebhookResponse: true,
			};
		}
		return {
			workflowData: [
				this.helpers.returnJsonArray([bodyData])
			],
		};
	}


}
