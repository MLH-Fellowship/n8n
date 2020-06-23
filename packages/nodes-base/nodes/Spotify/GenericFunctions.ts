import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IHookFunctions,
} from 'n8n-core';

import {
	IDataObject,
} from 'n8n-workflow';

// Array of String since the Code could be Nested
interface N8nErrorAPI {
    code: string[];
    message: string[];
}

interface N8nErrorAPIResponse {
    [key: string]: string;
    code: string;
    message: string;
}

// Global NODEs HELPER
// Note: the errorObj comes in a variety of forms and therefore must of type any
const errorHandler = (errorObj: any, box: N8nErrorAPI): N8nErrorAPIResponse => { // tslint:disable-line:no-any
  let errorObjCopy: any; // tslint:disable-line:no-any
  const apiStandard: N8nErrorAPIResponse = {code: '', message: ''};

  for (const [key, value] of Object.entries(box)) {
    errorObjCopy = errorObj;
    value.forEach((entry: string) => {
      errorObjCopy = errorObjCopy[entry];
	});
    apiStandard[key] = errorObjCopy.toString();
  }

  return apiStandard;
};


const userDisplayNodeError = (nodeName: string, statusCode: string, errorMessage: string): string => {
	throw new Error(`${nodeName} error response [${statusCode}]: ${errorMessage}`);
};

/**
 * Make an API request to Spotify
 *
 * @param {IHookFunctions} this
 * @param {string} method
 * @param {string} url
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function spotifyApiRequest(this: IHookFunctions | IExecuteFunctions,
	method: string, endpoint: string, body: object, query?: object): Promise<any> { // tslint:disable-line:no-any

	const options: OptionsWithUri = {
		method,
		headers: {
			'User-Agent': 'n8n',
			'Content-Type': 'text/plain',
			'Accept': ' application/json',
		},
		body,
		qs: query,
		uri: '',
		json: true
	};

	try {
		const credentials = this.getCredentials('spotifyOAuth2Api');

		if (credentials === undefined) {
			throw new Error('No credentials got returned!');
		}

		if (Object.keys(body).length === 0) {
			delete options.body;
		}

		const baseUrl = 'https://api.spotify.com/v1';

		options.uri = `${baseUrl}${endpoint}`;

		return await this.helpers.requestOAuth2.call(this, 'spotifyOAuth2Api', options);
	} catch (error) {
		const box2ToN8nErrorAPITransformer: N8nErrorAPI = {
			code: ["error", "error", "status"],
			message: ["error", "error", "message"]
		};

		const errorObj = errorHandler(error, box2ToN8nErrorAPITransformer);

		userDisplayNodeError("Spotify", errorObj.code, errorObj.message);
	}
}

export async function spotifyApiRequestAllItems(this: IHookFunctions | IExecuteFunctions,
	method: string, endpoint: string, body: object, query?: object): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;

	do {
		responseData = await spotifyApiRequest.call(this, method, endpoint, body, query);
		returnData.push(responseData);

		query = {
			'offset': responseData['limit'] + responseData['offset']
		};

	} while (
		responseData['next'] !== null
	);

	return returnData;
}
