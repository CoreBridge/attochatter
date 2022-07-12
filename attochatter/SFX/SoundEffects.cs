using System.Media;

namespace attochatter
{
    public enum SoundEffect
    {
        bubble_pop,
        doorbell
    }
    public class SoundEffects
    {
        public void Play(SoundEffect effect)
        {
            string file = effect == SoundEffect.doorbell ? "doorbell" : "bubble_pop";
            SoundPlayer player = new SoundPlayer("./SFX/"+file+".wav");
            player.Play();
        }
    }
}
