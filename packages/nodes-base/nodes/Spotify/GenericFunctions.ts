import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IHookFunctions,
} from 'n8n-core';

import {
	IDataObject,
} from 'n8n-workflow';

// Array of String since the Code could be Nested
interface n8nErrorAPI {
    code: string[];
    message: string[];
}

interface n8nErrorAPIResponse {
    [key: string]: string,
    code: string;
    message: string;
}

// Global NODEs HELPER
const get = (errorObj: any, box: n8nErrorAPI): n8nErrorAPIResponse => {
  let errorObjCopy: any;
  const apiStandard: n8nErrorAPIResponse = {code: '', message: ''};

  for (const [key, value] of Object.entries(box)) {
    errorObjCopy = errorObj;
    value.forEach((entry: string) => {
      errorObjCopy = errorObjCopy[entry];
	});
	//console.log(key);
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
		//console.log(error.error.status);

		const box2ToN8nErrorAPITransformer: n8nErrorAPI = {
			code: ["error", "error", "status"],
			message: ["error", "error", "message"]
		};

		const errorObj = get(error, box2ToN8nErrorAPITransformer);

		userDisplayNodeError("Spotify", errorObj.code, errorObj.message);

		// if (error.statusCode === 401) {
		// 	// Return a clear error
		// 	throw new Error('The Spotify credentials are not valid!');
		// }

		// if (error.statusCode === 403 && error.response.body.message === 'Player command failed: Premium required') {
		// 	throw new Error('You must have Spotify Premium for this operation!');
		// }

		// if (error.response && error.response.body && error.response.body.message) {
		// 	// Try to return the error prettier
		// 	throw new Error(`Spotify error response [${error.statusCode}]: ${error.response.body.message}`);
		// }

		// // If that data does not exist for some reason return the actual error
		// throw error;
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
