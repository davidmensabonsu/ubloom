

## Make Messages Sound More Natural and Self-Talk-Like

The current messages read like inspirational quotes or poetry. The goal is to rewrite them to sound like honest, casual self-talk — things you'd actually think or say to yourself.

### Changes

**1. Static fallback messages (`src/hooks/useHomeMessages.ts`)**

Rewrite both arrays to sound like natural inner dialogue:

**Future Self messages** — casual, warm, first-person-feeling self-talk:
- "Okay, I don't need to have everything figured out right now. I'm getting there."
- "Some days are just harder. That doesn't erase all the progress I've made."
- "I need to stop rushing. I'm allowed to take my time with this."
- "I've been through worse and came out the other side. I can handle today."
- "I keep forgetting — I'm actually doing really well. Like, genuinely."
- "Not everything needs to be perfect for me to feel good about where I am."
- "I'm choosing myself today, even if it feels uncomfortable."
- "The version of me I'm working toward? She'd be proud of me right now."

**Mindset messages** — short, grounded reminders:
- "I'm not behind. I'm on my own timeline."
- "Done is better than perfect today."
- "I don't have to earn rest."
- "I'm allowed to change my mind about who I want to be."
- "Not everything that feels urgent actually is."
- "I can do hard things, but I can also choose easy today."
- "My feelings are information, not instructions."
- "I don't owe anyone an explanation for taking care of myself."

**2. AI prompt (`supabase/functions/generate-home-messages/index.ts`)**

Update the system prompt tone instructions to request natural self-talk instead of poetic/inspirational language. Key changes:
- "Sound like something she'd actually think to herself — not a quote on a poster"
- "Use casual, honest language. Contractions, incomplete thoughts, real talk."
- "Avoid flowery metaphors or affirmation-speak"

