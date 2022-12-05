export interface Playlist {
  description: string,
  external_urls: { spotify: string },
  href: string,
  id: string,
  images: [{
    height: null | string,
    url: string,
    width: null | string
  }],
  name: string,
  owner: { display_name: string, href: string, id: string },
  primary_color: null | string,
  public: boolean,
  snapshot_id: string,
  tracks: { href: string, total: number },
  type: string,
  uri: string
}
