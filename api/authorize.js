import fetch from 'node-fetch';

const api_uri = process.env.API_URI;
const redirect_uri = process.env.REDIRECT_URI_DECODED;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

// export const config = {
//   runtime: 'experimental-edge',
// };

export default async function handler(req, res) {
  //haal token op met code die je krijgt van user login
  const tokens = await (await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: api_uri,
    }).toString(),
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  })).json();

  if (tokens.error) {
    res.json(tokens.error)
  } else {
    res.redirect(301, `${redirect_uri}?access_token=${tokens.access_token}`)
  }
}
