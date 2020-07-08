import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class FacebookLeadsApi implements ICredentialType {
	name = 'facebookLeadsApi';
	displayName = 'Facebook Leads API';
	properties = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'App Id',
			name: 'appId',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
