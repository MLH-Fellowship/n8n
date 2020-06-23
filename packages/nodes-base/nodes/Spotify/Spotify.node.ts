import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	spotifyApiRequest,
	spotifyApiRequestAllItems,
} from './GenericFunctions';


export class Spotify implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Spotify',
		name: 'spotify',
		icon: 'file:spotify.png',
		group: ['input'],
		version: 1,
		description: 'Access public song data via the Spotify API.',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		defaults: {
			name: 'Spotify',
			color: '#1DB954',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'spotifyOAuth2Api',
				required: true,
			},
		],
		properties: [
			// ----------------------------------------------------------
			//         Resource to Operate on
			//		   Player, Album, Artisits, Playlists, Tracks
			// ----------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Player',
						value: 'player',
					},
					{
						name: 'Albums',
						value: 'albums',
					},
					{
						name: 'Artists',
						value: 'artists',
					},
					{
						name: 'Playlists',
						value: 'playlists',
					},
					{
						name: 'Tracks',
						value: 'tracks',
					},
				],
				default: 'player',
				description: 'The resource to operate on.',
			},
			// --------------------------------------------------------------------------------------------------------
			//         Player Operations
			//		   Pause, Play, Get Recently Played, Get Currently Playing, Next Song, Previous Song, Add to Queue
			// --------------------------------------------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'player',
						],
					},
				},
				options: [
					{
						name: 'Pause',
						value: 'pause',
						description: 'Pause your music.',
					},
					{
						name: 'Start Music',
						value: 'startMusic',
						description: 'Start playing a playlist, artist, or album.'
					},
					{
						name: 'Recently Played',
						value: 'recentlyPlayed',
						description: 'Get your recently played tracks.'
					},
					{
						name: 'Currently Playing',
						value: 'currentlyPlaying',
						description: 'Get your currently playing track.'
					},
					{
						name: 'Next Song',
						value: 'nextSong',
						description: 'Skip to your next track.'
					},
					{
						name: 'Previous Song',
						value: 'previousSong',
						description: 'Skip to your previous song.'
					},
					{
						name: 'Add Song to Queue',
						value: 'addSongToQueue',
						description: 'Add a song to your queue.'
					}
				],
				default: 'pause',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Resource ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'player'
						],
						operation: [
							'startMusic',
						],
					},
				},
				placeholder: 'spotify:album:1YZ3k65Mqw3G8FzYlW1mmp',
				description: `Enter a playlist, artist, or album URI or ID.`,
			},
			{
				displayName: 'Track ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'player'
						],
						operation: [
							'addSongToQueue',
						],
					},
				},
				placeholder: 'spotify:track:0xE4LEFzSNGsz1F6kvXsHU',
				description: `Enter a track URI or ID.`,
			},
			// -----------------------------------------------
			//         Album Operations
			//		   Get an Album, Get an Album's Tracks
			// -----------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'albums',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get an album by URI or ID.',
					},
					{
						name: `Get Tracks`,
						value: 'getTracks',
						description: `Get an album's tracks by URI or ID.`,
					},
				],
				default: 'get',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Album ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'albums',
						],
					},
				},
				placeholder: 'spotify:album:1YZ3k65Mqw3G8FzYlW1mmp',
				description: `The album's Spotify URI or ID.`,
			},
			// -------------------------------------------------------------------------------------------------------------
			//         Artist Operations
			//		   Get an Artist, Get an Artist's Related Artists, Get an Artist's Top Tracks, Get an Artist's Albums
			// -------------------------------------------------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'artists',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get an artist by URI or ID.',
					},
					{
						name: `Get Related Artists`,
						value: 'getRelatedArtists',
						description: `Get an artist's related artists by URI or ID.`,
					},
					{
						name: `Get Top Tracks`,
						value: 'getTopTracks',
						description: `Get an artist's top tracks by URI or ID.`,
					},
					{
						name: `Get Albums`,
						value: 'getAlbums',
						description: `Get an artist's albums by URI or ID.`,
					},
				],
				default: 'get',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Artist ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'artists',
						],
					},
				},
				placeholder: 'spotify:artist:4LLpKhyESsyAXpc4laK94U',
				description: `The artist's Spotify URI or ID.`,
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: 'US',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'artists'
						],
						operation: [
							'getTopTracks',
						],
					},
				},
				placeholder: 'US',
				description: `Top tracks in which country? Enter the postal abbriviation.`,
			},
			// -------------------------------------------------------------------------------------------------------------
			//         Playlist Operations
			//		   Get a Playlist, Get a Playlist's Tracks, Add/Remove a Song from a Playlist, Get a User's Playlists
			// -------------------------------------------------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'playlists',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a playlist by URI or ID.',
					},
					{
						name: `Get Tracks`,
						value: 'getTracks',
						description: `Get a playlist's tracks by URI or ID.`,
					},
					{
						name: 'Remove an Item',
						value: 'delete',
						description: 'Remove tracks from a playlist by track and playlist URI or ID.',
					},
					{
						name: 'Add an Item',
						value: 'add',
						description: 'Add tracks from a playlist by track and playlist URI or ID.',
					},
					{
						name: `Get the User's Playlists`,
						value: 'getUserPlaylists',
						description: `Get a user's playlists.`,
					},
				],
				default: 'get',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Playlist ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'playlists'
						],
						operation: [
							'add',
							'delete',
							'get',
							'getTracks'
						],
					},
				},
				placeholder: 'spotify:playlist:37i9dQZF1DWUhI3iC1khPH',
				description: `The playlist's Spotify URI or its ID.`,
			},
			{
				displayName: 'Track ID',
				name: 'trackID',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'playlists'
						],
						operation: [
							'add',
							'delete'
						],
					},
				},
				placeholder: 'spotify:track:0xE4LEFzSNGsz1F6kvXsHU',
				description: `The track's Spotify URI or its ID. The track to add/delete from the playlist.`,
			},
			// -----------------------------------------------------
			//         Track Operations
			//		   Get a Track, Get a Track's Audio Features
			// -----------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'tracks',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a track by its URI or ID.',
					},
					{
						name: 'Get Audio Features',
						value: 'getAudioFeatures',
						description: 'Get audio features for a track by URI or ID.',
					},
				],
				default: 'tracks',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Track ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'tracks',
						],
					},
				},
				placeholder: 'spotify:track:0xE4LEFzSNGsz1F6kvXsHU',
				description: `The track's Spotify URI or ID.`,
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				required: true,
				displayOptions: {
					show: {
						resource: [
							'player',
							'albums',
							'artists',
							'playlists'
						],
						operation: [
							'getTracks',
							'getAlbums',
							'getUserPlaylists'
						]
					},
				},
				description: `The number of items to return.`,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				required: true,
				displayOptions: {
					show: {
						resource: [
							'player',
							'albums',
							'artists',
							'playlists'
						],
						operation: [
							'recentlyPlayed',
							'getTracks',
							'getAlbums',
							'getUserPlaylists'
						],
						returnAll: [
							false,
						],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: `The number of items to return.`,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				required: true,
				displayOptions: {
					show: {
						resource: [
							'player',
						],
						operation: [
							'recentlyPlayed',
						],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 50,
				},
				description: `The number of items to return.`,
			},
		]
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Get all of the incoming input data to loop through
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		// For Post
		let body: IDataObject;
		// For Query string
		let qs: IDataObject;

		let requestMethod: string;
		let endpoint: string;
		let returnAll: boolean;

		const operation = this.getNodeParameter('operation', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const fullOperation = `${resource}/${operation}`;


		const filterItemsFlow = [
			'player/recentlyPlayed',
			'albums/getTracks',
			'artists/getAlbums',
			'playlists/getUserPlaylists',
			'playlists/getTracks',
		];

		// Set initial values
		requestMethod = 'GET';
		endpoint = '';
		body = {};
		qs = {};
		returnAll = false;

		for(let i = 0; i < items.length; i++) {
			// -----------------------------
			//      Player Operations
			// -----------------------------
			if( resource === 'player' ) {
				if(operation === 'pause') {
					requestMethod = 'PUT';

					endpoint = `/me/${resource}/pause`;
				} else if(operation === 'recentlyPlayed') {
					requestMethod = 'GET';

					endpoint = `/me/${resource}/recently-played`;

					//returnAll = this.getNodeParameter('returnAll', 0) as boolean;

					//if(!returnAll) {
						const limit = this.getNodeParameter('limit', 0) as number;

						qs = {
							'limit': limit
						};
					//}
				} else if(operation === 'currentlyPlaying') {
					requestMethod = 'GET';

					endpoint = `/me/${resource}/currently-playing`;
				} else if(operation === 'nextSong') {
					requestMethod = 'POST';

					endpoint = `/me/${resource}/next`;
				} else if(operation === 'previousSong') {
					requestMethod = 'POST';

					endpoint = `/me/${resource}/previous`;
				} else if(operation === 'startMusic') {
					requestMethod = 'PUT';

					endpoint = `/me/${resource}/play`;

					const id = this.getNodeParameter('id', i) as string;

					body.context_uri = id;
				} else if(operation === 'addSongToQueue') {
					requestMethod = 'POST';

					endpoint = `/me/${resource}/queue`;

					const id = this.getNodeParameter('id', i) as string;

					qs = {
						'uri': id
					};
				}
			// -----------------------------
			//      Album Operations
			// -----------------------------
			} else if( resource === 'albums') {
				const uri = this.getNodeParameter('id', i) as string;

				const id = uri.replace('spotify:album:', '');

				requestMethod = 'GET';

				if(operation === 'get') {
					endpoint = `/${resource}/${id}`;
				} else if(operation === 'getTracks') {
					endpoint = `/${resource}/${id}/tracks`;

					returnAll = this.getNodeParameter('returnAll', 0) as boolean;

					if(!returnAll) {
						const limit = this.getNodeParameter('limit', 0) as number;

						qs = {
							'limit': limit
						};
					}
				}
			// -----------------------------
			//      Artist Operations
			// -----------------------------
			} else if( resource === 'artists') {
				const uri = this.getNodeParameter('id', i) as string;

				const id = uri.replace('spotify:artist:', '');

				requestMethod = 'GET';

				endpoint = `/${resource}/${id}`;

				if(operation === 'getAlbums') {
					endpoint = endpoint + `/albums`;

					returnAll = this.getNodeParameter('returnAll', 0) as boolean;

					if(!returnAll) {
						const limit = this.getNodeParameter('limit', 0) as number;

						qs = {
							'limit': limit
						};
					}
				} else if(operation === 'getRelatedArtists') {

					endpoint = endpoint + `/related-artists`;

				} else if(operation === 'getTopTracks'){
					const country = this.getNodeParameter('country', i) as string;

					qs = {
						'country': country
					};

					endpoint = endpoint + `/top-tracks`;
				}
			// -----------------------------
			//      Playlist Operations
			// -----------------------------
			} else if( resource === 'playlists') {
				if(['delete', 'get', 'getTracks', 'add'].includes(operation)) {
					const uri = this.getNodeParameter('id', i) as string;

					const id = uri.replace('spotify:playlist:', '');

					if(operation === 'delete') {
						requestMethod = 'DELETE';
						const trackId = this.getNodeParameter('trackID', i) as string;

						body.tracks = [
							{
								"uri": `${trackId}`,
								"positions": [
								0
								]
							}
						];

						endpoint = `/${resource}/${id}/tracks`;
					} else if(operation === 'get') {
						requestMethod = 'GET';

						endpoint = `/${resource}/${id}`;
					} else if(operation === 'getTracks') {
						requestMethod = 'GET';

						endpoint = `/${resource}/${id}/tracks`;

						returnAll = this.getNodeParameter('returnAll', 0) as boolean;

						if(!returnAll) {
							const limit = this.getNodeParameter('limit', 0) as number;

							qs = {
								'limit': limit
							};
						}
					} else if(operation === 'add') {
						requestMethod = 'POST';

						const trackId = this.getNodeParameter('trackID', i) as string;

						qs = {
							'uris': trackId
						};

						endpoint = `/${resource}/${id}/tracks`;
					}
				} else if(operation === 'getUserPlaylists') {
					requestMethod = 'GET';

					endpoint = `/me/${resource}`;

					returnAll = this.getNodeParameter('returnAll', 0) as boolean;

					if(!returnAll) {
						const limit = this.getNodeParameter('limit', 0) as number;

						qs = {
							'limit': limit
						};
					}
				}
			// -----------------------------
			//      Track Operations
			// -----------------------------
			} else if( resource === 'tracks') {
				const uri = this.getNodeParameter('id', i) as string;

				const id = uri.replace('spotify:track:', '');

				requestMethod = 'GET';

				if(operation === 'getAudioFeatures') {
					endpoint = `/audio-features/${id}`;
				} else if(operation === 'get') {
					endpoint = `/${resource}/${id}`;
				}
			}

			let responseData;

			if(returnAll) {
				responseData = await spotifyApiRequestAllItems.call(this, requestMethod, endpoint, body, qs);
			} else {
				responseData = [await spotifyApiRequest.call(this, requestMethod, endpoint, body, qs)];
			}

			// Spotify returns the data in a way that makes processing individual items quite difficult, and so I simplify the output
			// for certain requests
			for(let i = 0; i < responseData.length; i++) {
				if(filterItemsFlow.includes(fullOperation)) {
					for(let j = 0; j < responseData[i].items.length; j++) {
						returnData.push(responseData[i].items[j]);
					}
				} else if(['artists/getRelatedArtists'].includes(fullOperation)) {
					for(let j = 0; j < responseData[i].artists.length; j++) {
						returnData.push(responseData[i].artists[j]);
					}
				} else if(['artists/getTopTracks'].includes(fullOperation)) {
					for(let j = 0; j < responseData[i].tracks.length; j++) {
						returnData.push(responseData[i].tracks[j]);
					}
				} else {
					returnData.push(responseData[i]);
				}
			}
		}

		if( returnData[0] === undefined ) {
			if(requestMethod === 'GET') {
				return [this.helpers.returnJsonArray({})];
			} else {
				return [this.helpers.returnJsonArray({ success: true })];
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
