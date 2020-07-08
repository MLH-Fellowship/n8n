import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	OptionsWithUri,
} from 'request';

import {
	IDataObject,
} from 'n8n-workflow';

export async function facebookLeadsApiRequest(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: object, qs?: IDataObject): Promise<any> { // tslint:disable-line:no-any
	const credentials = this.getCredentials('facebookLeadsApi');

	if (credentials === undefined) {
		throw new Error('No credentials got returned!');
	}

	qs = qs || {};

	const options: OptionsWithUri = {
		// headers: {
		// 	'Content-Type': 'application/json',
		// 	'Authorization': `Bearer ${credentials.apiKey}`,
		// },
		method,
		body,
		qs,
		uri: `${endpoint}`,
		json: true,
	};

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		if (error.statusCode === 401) {
			// Return a clear error
			throw new Error('The Customer.io credentials are not valid!');
		}

		if (error.response && error.response.body && error.response.body.error_code) {
			// Try to return the error prettier
			const errorBody = error.response.body;
			throw new Error(`Customer.io error response [${errorBody.error_code}]: ${errorBody.description}`);
		}

		// Expected error data did not get returned so throw the actual error
		throw error;
	}
}
