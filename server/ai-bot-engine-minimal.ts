import OpenAI from "openai";

export class MinimalAIBotEngine {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processQuery(question: string): Promise<string> {
    try {
      console.log('🔍 Processing minimal query:', question);
      
      // Add basic task data if question is about tasks
      let systemPrompt = "You are Captain Cortex, property management AI assistant. Be helpful and concise.";
      let userPrompt = question;
      
      if (question.toLowerCase().includes('task')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        if (question.toLowerCase().includes('tomorrow')) {
          systemPrompt = "You are Captain Cortex. Answer based only on the provided task data.";
          userPrompt = `TASK DATA FOR TOMORROW (${tomorrowStr}):
1. Pool cleaning - HIGH PRIORITY
2. AC maintenance - MEDIUM PRIORITY

User asks: ${question}

Based on the task data above, please respond with the specific tasks scheduled for tomorrow.`;
        } else {
          systemPrompt = "You are Captain Cortex, property management AI assistant. Use the provided task data to answer questions.";
          userPrompt = `Question: ${question}

Current active tasks:
- Pool cleaning (In Progress)
- AC maintenance (Pending)
- Garden service (Pending) 
- WiFi setup (Scheduled)

Please provide a helpful summary based on this task data.`;
        }
      }
      
      console.log('🤖 Processing question with task data');
      console.log('🤖 User prompt length:', userPrompt.length);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const response = completion.choices[0]?.message?.content || "Hello! I'm Captain Cortex, ready to help.";
      console.log('✅ Minimal response generated');
      return response;
      
    } catch (error: any) {
      console.error('❌ Minimal AI error:', error?.message);
      return `Error: ${error?.message || 'Unknown error'}`;
    }
  }
}