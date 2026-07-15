import { supabase } from "./supabase";
import { UserProfile } from "../types";

export interface SpotifyTrackInfo {
  track: string;
  artist: string;
  albumArt: string;
  isPlaying: boolean;
  trackId?: string;
}

// Client-side PKCE cryptography helpers
function dec2hex(dec: number): string {
  return dec.toString(16).padStart(2, "0");
}

export function generateCodeVerifier(): string {
  const array = new Uint32Array(56);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a: ArrayBuffer): string {
  let str = "";
  const bytes = new Uint8Array(a);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generateCodeChallenge(v: string): Promise<string> {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}

/**
 * Refreshes the Spotify access token using Spotify's client-side PKCE token refresh endpoint.
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
  try {
    // Check if it is a simulated token (for sandbox/demo testing)
    if (refreshToken.startsWith("simulated_")) {
      return {
        accessToken: "simulated_access_token_" + Date.now(),
        expiresAt: Date.now() + 3600 * 1000
      };
    }

    const clientId = (import.meta as any).env.VITE_SPOTIFY_CLIENT_ID;
    if (!clientId) {
      throw new Error("VITE_SPOTIFY_CLIENT_ID environment variable is not defined");
    }

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Refresh request failed: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    if (!data.access_token) {
      throw new Error("No access token returned in refresh response");
    }

    const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    return {
      accessToken: data.access_token,
      expiresAt
    };
  } catch (err) {
    console.error("Failed to refresh Spotify token:", err);
    throw err;
  }
}

/**
 * Polls Spotify for the currently playing track of a user.
 * Automatically handles token expiration and token refreshes.
 * Saves the track status into the user's profile.
 */
export async function updateCurrentlyPlaying(user: UserProfile): Promise<SpotifyTrackInfo | null> {
  // If Spotify is disabled or not linked, do nothing
  if (!user.spotify_linked || !user.spotify_access_token) {
    return null;
  }

  // If user disabled the listening status completely
  if (!user.spotify_listening_enabled) {
    // If we previously had active playing status, clear it
    if (user.spotify_is_playing) {
      const updateData = {
        spotify_is_playing: false,
        spotify_last_updated: Date.now()
      };
      await supabase.from("profiles").update(updateData).eq("id", user.id);
    }
    return null;
  }

  let accessToken = user.spotify_access_token;
  let expiresAt = user.spotify_token_expires_at || 0;
  const refreshToken = user.spotify_refresh_token;

  // 1. Handle token expiration (refresh 5 minutes early to be safe)
  if (refreshToken && (Date.now() + 5 * 60 * 1000 >= expiresAt || !accessToken)) {
    try {
      console.log("Spotify access token expiring soon, refreshing...");
      const refreshed = await refreshSpotifyToken(refreshToken);
      accessToken = refreshed.accessToken;
      expiresAt = refreshed.expiresAt;

      // Persist the refreshed token back to Firestore
      await supabase.from("profiles").update({
        spotify_access_token: accessToken,
        spotify_token_expires_at: expiresAt
      }).eq("id", user.id);
    } catch (e) {
      console.error("Could not refresh Spotify token during playback poll:", e);
      return null;
    }
  }

  // 2. Fetch current song from Spotify API (or simulate if in simulated/sandbox mode)
  if (accessToken.startsWith("simulated_")) {
    // Return a random cool simulated track so the sandbox experience is extremely interactive and fun!
    const songs = [
      { track: "Blinding Lights", artist: "The Weeknd", albumArt: "https://i.scdn.co/image/ab67616d0000b2738863d65b3ec1114c7cc03211", trackId: "0VjIjW4GlUZg7vClvLQ6mB" },
      { track: "Starboy", artist: "The Weeknd ft. Daft Punk", albumArt: "https://i.scdn.co/image/ab67616d0000b2734718dec6954e477c98e61e4b", trackId: "78912" },
      { track: "Sweater Weather", artist: "The Neighbourhood", albumArt: "https://i.scdn.co/image/ab67616d0000b27382261647644e13c84074abaf", trackId: "2TpxZ7JUBn3uw466679" },
      { track: "Another Love", artist: "Tom Odell", albumArt: "https://i.scdn.co/image/ab67616d0000b273191c20ece326437fe0ee68e3", trackId: "4pt78" },
      { track: "As It Was", artist: "Harry Styles", albumArt: "https://i.scdn.co/image/ab67616d0000b273b46f74097655d7d353caab14", trackId: "4D6493" }
    ];

    // Every poll has a 90% chance of playing a song in sandbox mode
    const isPlaying = Math.random() < 0.9;
    const existingIndex = parseInt(localStorage.getItem("spotify_simulated_index") || "0");
    const nextSong = songs[existingIndex % songs.length];
    
    // Periodically change songs (every 3 polls)
    const pollCount = parseInt(localStorage.getItem("spotify_simulated_polls") || "0") + 1;
    localStorage.setItem("spotify_simulated_polls", pollCount.toString());
    if (pollCount % 4 === 0) {
      localStorage.setItem("spotify_simulated_index", (existingIndex + 1).toString());
    }

    const updateData = {
      spotify_track: isPlaying ? nextSong.track : "",
      spotify_artist: isPlaying ? nextSong.artist : "",
      spotify_album_art: isPlaying ? nextSong.albumArt : "",
      spotify_is_playing: isPlaying,
      spotify_track_id: isPlaying ? nextSong.trackId : "",
      spotify_last_updated: Date.now()
    };

    // Only update if something changed to avoid writing to Firestore on every loop
    if (
      user.spotify_track !== updateData.spotify_track ||
      user.spotify_artist !== updateData.spotify_artist ||
      user.spotify_is_playing !== updateData.spotify_is_playing
    ) {
      await supabase.from("profiles").update(updateData).eq("id", user.id);
    }

    return {
      track: updateData.spotify_track,
      artist: updateData.spotify_artist,
      albumArt: updateData.spotify_album_art,
      isPlaying: updateData.spotify_is_playing,
      trackId: updateData.spotify_track_id
    };
  }

  // 3. Real Spotify API call
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (res.status === 204) {
      // No active playback
      if (user.spotify_is_playing) {
        await supabase.from("profiles").update({
          spotify_is_playing: false,
          spotify_last_updated: Date.now()
        }).eq("id", user.id);
      }
      return { track: "", artist: "", albumArt: "", isPlaying: false };
    }

    if (!res.ok) {
      if (res.status === 401) {
        // Token is invalid, try to clear or force refresh next time
        console.warn("Spotify API returned 401 Unauthorized.");
      }
      return null;
    }

    const data = await res.json();
    const isPlaying = data.is_playing && data.item;
    const trackName = isPlaying ? data.item.name : "";
    const artistName = isPlaying ? data.item.artists.map((a: any) => a.name).join(", ") : "";
    const albumArt = isPlaying && data.item.album.images.length > 0 ? data.item.album.images[0].url : "";
    const trackId = isPlaying ? data.item.id : "";

    const updateData = {
      spotify_track: trackName,
      spotify_artist: artistName,
      spotify_album_art: albumArt,
      spotify_is_playing: isPlaying,
      spotify_track_id: trackId,
      spotify_last_updated: Date.now()
    };

    // Minimize Firestore writes by only updating on song or status change
    if (
      user.spotify_track !== trackName ||
      user.spotify_artist !== artistName ||
      user.spotify_is_playing !== isPlaying
    ) {
      await supabase.from("profiles").update(updateData).eq("id", user.id);
    }

    return {
      track: trackName,
      artist: artistName,
      albumArt: albumArt,
      isPlaying: isPlaying,
      trackId: trackId
    };
  } catch (err) {
    console.error("Error calling Spotify currently-playing API:", err);
    return null;
  }
}
