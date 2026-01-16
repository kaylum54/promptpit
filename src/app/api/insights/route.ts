import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import type { ChatModelKey, IntentCategory } from '@/lib/types';

interface ModelUsage {
  model: ChatModelKey;
  count: number;
}

interface CategoryUsage {
  category: IntentCategory;
  count: number;
}

interface ModelWins {
  model: ChatModelKey;
  wins: number;
}

interface DailyActivity {
  date: string;
  chats: number;
  messages: number;
}

/**
 * GET /api/insights
 * Returns user's usage insights and statistics
 */
export async function GET() {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Get total chats
    const { count: totalChats } = await supabase
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth0User.sub);

    // Get total messages
    const { data: chatIds } = await supabase
      .from('chats')
      .select('id')
      .eq('user_id', auth0User.sub);

    const chatIdList = (chatIds || []).map((c: { id: string }) => c.id);

    let totalMessages = 0;
    if (chatIdList.length > 0) {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('chat_id', chatIdList);
      totalMessages = count || 0;
    }

    // Get model usage from messages
    const modelUsage: ModelUsage[] = [];
    if (chatIdList.length > 0) {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('model')
        .in('chat_id', chatIdList)
        .eq('role', 'assistant')
        .not('model', 'is', null);

      if (messages) {
        const modelCounts: Record<string, number> = {};
        (messages as Array<{ model: string }>).forEach((m) => {
          if (m.model) {
            modelCounts[m.model] = (modelCounts[m.model] || 0) + 1;
          }
        });
        Object.entries(modelCounts).forEach(([model, count]) => {
          modelUsage.push({ model: model as ChatModelKey, count });
        });
        modelUsage.sort((a, b) => b.count - a.count);
      }
    }

    // Get category usage from messages
    const categoryUsage: CategoryUsage[] = [];
    if (chatIdList.length > 0) {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('category')
        .in('chat_id', chatIdList)
        .eq('role', 'assistant')
        .not('category', 'is', null);

      if (messages) {
        const categoryCounts: Record<string, number> = {};
        (messages as Array<{ category: string }>).forEach((m) => {
          if (m.category) {
            categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
          }
        });
        Object.entries(categoryCounts).forEach(([category, count]) => {
          categoryUsage.push({ category: category as IntentCategory, count });
        });
        categoryUsage.sort((a, b) => b.count - a.count);
      }
    }

    // Get debate stats
    const { count: totalDebates } = await supabase
      .from('debates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth0User.sub);

    // Get debates this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: debatesThisMonth } = await supabase
      .from('debates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth0User.sub)
      .gte('created_at', startOfMonth.toISOString());

    // Get model wins from debates
    const modelWins: ModelWins[] = [];
    const { data: debates } = await supabase
      .from('debates')
      .select('verdict')
      .eq('user_id', auth0User.sub)
      .not('verdict', 'is', null);

    if (debates) {
      const winCounts: Record<string, number> = {};
      (debates as Array<{ verdict: { winner?: string } | null }>).forEach((d) => {
        const winner = d.verdict?.winner;
        if (winner) {
          winCounts[winner] = (winCounts[winner] || 0) + 1;
        }
      });
      Object.entries(winCounts).forEach(([model, wins]) => {
        modelWins.push({ model: model as ChatModelKey, wins });
      });
      modelWins.sort((a, b) => b.wins - a.wins);
    }

    // Get recent activity (last 7 days)
    const recentActivity: DailyActivity[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      let dayMessages = 0;
      let dayChats = 0;

      if (chatIdList.length > 0) {
        const { count: msgCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .in('chat_id', chatIdList)
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());

        dayMessages = msgCount || 0;
      }

      const { count: chatCount } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', auth0User.sub)
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      dayChats = chatCount || 0;

      recentActivity.push({
        date: date.toISOString().split('T')[0],
        chats: dayChats,
        messages: dayMessages,
      });
    }

    return NextResponse.json({
      totalChats: totalChats || 0,
      totalMessages,
      modelUsage,
      categoryUsage,
      debateStats: {
        total: totalDebates || 0,
        thisMonth: debatesThisMonth || 0,
        modelWins,
      },
      recentActivity,
    });

  } catch (error) {
    console.error('Error in GET /api/insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
