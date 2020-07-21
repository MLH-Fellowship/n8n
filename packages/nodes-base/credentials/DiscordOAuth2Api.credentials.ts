import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class DiscordOAuth2Api implements ICredentialType {
	name = 'discordOAuth2Api';
	extends = [
		'oAuth2Api',
	];
	displayName = 'Discord OAuth2 API';
	properties = [
		{
			displayName: 'Discord Server',
			name: 'server',
			type: 'string' as NodePropertyTypes,
			default: 'https://discord.com/api',
			description: 'The server to connect to. Does only have to get changed if Github Enterprise gets used.',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden' as NodePropertyTypes,
			default: 'https://discord.com/api/oauth2/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden' as NodePropertyTypes,
			default: 'https://discord.com/api/oauth2/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden' as NodePropertyTypes,
			default: 'guilds',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden' as NodePropertyTypes,
			default: 'prompt=consent',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden' as NodePropertyTypes,
			default: 'header',
		},
	];
}
