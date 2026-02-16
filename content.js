export const prompt = `
Please produce chapter markers for a church service based on this transcript.

In a normal service, only use the following headings, adding song and reading names as per the example. Content in brackets are notes for you, not part of the heading.

- Introduction & call to worship
- Song
- Children's talk
- Children's song
- Offering & prayer
- Notices
- Old Testament Reading
- Prayer
- New Testament Reading
- Reading (only use if you can't tell if it's from the old or new testament)
- Sermon
- Closing prayer
- Benediction
- Benediction song
- End of service

In a service with communion, the communion proceedings should all be under the single heading "Communion".

Here is an example, with example timestamps and song and reading names, showing the expected format:

0:01:00 Introduction & call to worship
0:02:00 Song: Amazing Grace
0:03:00 Children's talk & song
0:04:00 Song: Behold Our God
0:05:00 Song: Let Your Kingdom Come
0:08:00 Offering & Prayer
0:09:00 Notices
0:10:00 Old Testament Reading: Isaiah 50
0:11:00 Prayer
0:12:00 Song: How Deep the Father's Love
0:13:00 New Testament Reading: Philippians 2
0:14:00 Sermon
0:42:00 Closing prayer
0:43:00 Song: Great is Thy Faithfulness
0:44:00 Benediction song: May the Peace
0:45:00 End of service

The above is just an example, though. Please ensure the timestamps are accurate to the second and correspond to the content of the transcript provided. The transcript is from YouTube's automatic speech recognition, so there may be some inaccuracies. If something seems likely incorrect, ignore it.

Song name identification guidelines:
- Try to identify the name of each song, including the benediction song.
- If the transcript explicitly identifies the name of the song, use that.
- Check the "additional song list" below for songs that are not well known.
- If you can identify the name of the song with high confidence from your own knowledge, use that.
- If the song is still not identified, search the web for the lyrics to try to identify it. Search for a sequence of words from the transcript, e.g. several lines of the song. For example, search for "bless the Lord O my Soul O My Soul Worship His Holy Name Sing Like Never Before". Try to identify the song from the search results.
- Use the search tool only once per song, don't try to search for multiple songs at once. You can perform searches for as many songs as needed.
- Only if all of the above steps fail to identify the song, label it as "Song" without a name.

Other guidelines:
- Only use headings from the example above, except for irregular events such as baptisms, joining of new members
- Do not search the web for any other purpose than to try to identify the name of a song.
- If you can't tell what a reading is, only give the level of detail you can be sure of (e.g., "Old Testament Reading", "New Testament Reading" or just "Reading").
- Do not provide commentry such as (title unclear) or (starts "my hope rests").
- Do not provide content summary such as "Prayer / confession (opening prayer: holiness, forgiveness)", just provide a broad label such as "Prayer", "Closing prayer".
- Ensure that the "Introduction & call to worship" and "End of service" labels are present exactly as shown, as these will be used later to trim the video. "Introduction & call to worship" must be a second or two before the pastor starts speaking, and "End of service" must be a few seconds after the benediction song ends.
- It is better for the timestamp of a song to be earlier than the actual start of the song than later. Don't wait for the first line of the song, if there are words indicating a song is starting, such as [music] or "let's sing" then this is the best time to start the timestamp for the song, even if the first line of the song is many seconds later.
- The overall output must consist of absolutely nothing other than the chapter markers in the format shown in the example.

Additional song list (songs that may be difficult or impossible to find via a web search), with name followed by some lyrics:
- Bless the Lord O My Soul (Psalm 103) - not to be confused with 10,000 Reasons which also contains "Bless the Lord O My Soul"
    My God is slow to anger when I go astray
    Bless the Lord, O my soul
    For all of my betrayals, He will not repay
    Bless the Lord, O my soul
- Whom Have I In Heaven
    Whom have I in heaven but you, Lord
    Besides you I've nothing on Earth
    My heart and my flesh may fail, Lord
    But you are the strength of my heart

Here is the transcript, in SRT format with the sequence numbers removed:
`;
