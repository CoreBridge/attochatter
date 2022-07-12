namespace attochatter
{
    public struct OldMessage
    {
        public string username;
        public string message;
    }

    public class ChatroomCatchup
    {
        private Dictionary<string, List<OldMessage>> ChatroomLastTenMessages = new Dictionary<string, List<OldMessage>>();

        public void TrackChat(string chatroom, string username, string message)
        {
            if (!ChatroomLastTenMessages.ContainsKey(chatroom))
            {
                ChatroomLastTenMessages.Add(chatroom, new List<OldMessage>(10));
            }
            if (ChatroomLastTenMessages[chatroom].Count >= 10)
                ChatroomLastTenMessages[chatroom].RemoveAt(0);
            ChatroomLastTenMessages[chatroom].Add(new OldMessage() { message = message, username = username});
        }

        public OldMessage[] GetLastTenMessages(string chatroom)
        {
            if (ChatroomLastTenMessages.ContainsKey(chatroom))
            {
                return ChatroomLastTenMessages[chatroom].ToArray();
            } 
            else
            {
                return new OldMessage[0];
            }
        }
    }
}
