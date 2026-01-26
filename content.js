export const prompt = `
Please produce chapter markers for a church service based on this transcript. Here is an example of the sort of chapter markers I would like:

- 0:00:00 Start of recording
- 0:01:00 Introduction & call to worship
- 0:02:00 Song: Amazing Grace
- 0:03:00 Children's talk & song
- 0:04:00 Song: Behold Our God
- 0:05:00 Song: Let Your Kingdom Come
- 0:08:00 Offering & Prayer
- 0:09:00 Notices
- 0:10:00 Old Testament Reading: Isaiah 50
- 0:11:00 Prayer
- 0:12:00 Song: How Deep the Father's Love
- 0:13:00 New Testament Reading: Philippians 2
- 0:14:00 Sermon
- 0:42:00 Closing prayer
- 0:43:00 Song: Great is Thy Faithfulness
- 0:44:00 Benediction song: May the Peace
- 0:45:00 End of service

The above is just an example, though. Please ensure the timestamps are accurate to the second and correspond to the content of the transcript provided. The transcript is from YouTube's automatic speech recognition, so there may be some inaccuracies. If something seems likely incorrect, ignore it.

Observe these guidelines:
1. If you can't reliably tell the name of a song, just label it as "Song".
2. If you can't tell what a reading is, only give the level of detail you can be sure of (e.g., "Old Testament Reading", "New Testament Reading" or just "Reading").
3. Do not provide commentry such as (title unclear) or (starts "my hope rests").
4. Do not provide content summary such as "Prayer / confession (opening prayer: holiness, forgiveness)", just provide a broad label such as "Prayer", "Closing prayer".
5. Ensure that the "Introduction & call to worship" and "End of service" labels are present exactly as shown, as these will be used later to trim the video. "Introduction & call to worship" must be a second or two before the pastor starts speaking, and "End of service" must be a few seconds after the benediction song ends.

Here is the transcript, in SRT format with the sequence numbers removed:
`;