import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class ConvertKitApi implements ICredentialType {
	name = 'convertKitApi';
	displayName = 'Convert Kit Api';
	properties = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string' as NodePropertyTypes,
			default: '',
			typeOptions: {
				password: true,
			},
		},
	];
}
