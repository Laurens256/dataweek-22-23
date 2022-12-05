export interface SpotifyAuth {
    client_id: string;
    response_type: 'code' | string;
    redirect_uri: string;
    scope:  string;
}
