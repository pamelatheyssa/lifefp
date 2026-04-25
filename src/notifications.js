// ─── Serviço de Notificações ─────────────────────────────────────────────────
let _plugin = null

const isNative = () =>
  typeof window !== 'undefined' &&
  window.Capacitor?.isNativePlatform?.() === true

async function getPlugin() {
  if (!isNative()) return null
  if (_plugin) return _plugin
  try {
    const mod = await import('@capacitor/local-notifications')
    _plugin = mod.LocalNotifications
  } catch { _plugin = null }
  return _plugin
}

// Gera um ID inteiro válido para notificação (1 a 2^31-1)
function makeNotifId(seed) {
  if (seed && typeof seed === 'number' && seed > 0 && seed < 2147483647) return seed
  return Math.floor(Math.random() * 2000000000) + 1
}

export async function requestNotificationPermission() {
  if (isNative()) {
    const plugin = await getPlugin()
    if (plugin) {
      const { display } = await plugin.requestPermissions()
      return display === 'granted'
    }
  }
  if ('Notification' in window) {
    const result = await Notification.requestPermission()
    return result === 'granted'
  }
  return false
}

export async function scheduleTaskNotification({ id, title, body, date, time }) {
  if (!date || !time) return
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute]     = time.split(':').map(Number)
  const fireAt = new Date(year, month - 1, day, hour, minute, 0)
  if (fireAt <= new Date()) return

  const notifId = makeNotifId(id)

  if (isNative()) {
    const plugin = await getPlugin()
    if (plugin) {
      try {
        // Cancela primeiro para evitar duplicatas
        await plugin.cancel({ notifications: [{ id: notifId }] }).catch(()=>{})
        await plugin.schedule({
          notifications: [{
            id:       notifId,
            title:    '📋 Life Planner',
            body:     title + (body ? `\n${body}` : ''),
            schedule: { at: fireAt, allowWhileIdle: true },
            sound:    'default',
            smallIcon:'ic_stat_icon_config_sample',
            iconColor:'#534AB7',
          }]
        })
        console.log('Notificação agendada:', title, 'para', fireAt)
      } catch (e) {
        console.error('Erro ao agendar notificação:', e)
      }
      return
    }
  }

  // Web fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    const delay = fireAt.getTime() - Date.now()
    if (delay > 0 && delay < 86400000 * 7) {
      setTimeout(() => {
        new Notification('📋 Life Planner', {
          body: title, icon: '/icon-192.png',
          tag: `task-${notifId}`, renotify: true
        })
      }, delay)
    }
  }
}

export async function cancelTaskNotification(id) {
  const notifId = makeNotifId(id)
  if (isNative()) {
    const plugin = await getPlugin()
    if (plugin) {
      try { await plugin.cancel({ notifications: [{ id: notifId }] }) }
      catch (e) { console.warn('Erro ao cancelar notificação:', e) }
    }
  }
}

export async function rescheduleAll(tasks) {
  if (!isNative()) return
  const plugin = await getPlugin()
  if (!plugin) return
  try {
    const { display } = await plugin.checkPermissions()
    if (display !== 'granted') return
    for (const task of tasks) {
      if (task.notifyAt && task.date && !task.done) {
        await scheduleTaskNotification({
          id:    makeNotifId(task._notifId),
          title: task.title,
          date:  task.date,
          time:  task.notifyAt,
        })
      }
    }
  } catch (e) {
    console.warn('rescheduleAll error:', e)
  }
}

export function updateWidgetData(events) {
  try {
    const today   = new Date().toISOString().split('T')[0]
    const todayEv = (events || [])
      .filter(e => e.date === today)
      .sort((a, b) => (a.time||'').localeCompare(b.time||''))
      .slice(0, 8)
      .map(e => ({ title:e.title, time:e.time, color:e.color, done:e.done, allDay:e.allDay }))
    const payload = JSON.stringify({ date:today, events:todayEv, updatedAt:Date.now() })
    localStorage.setItem('lp_widget_data', payload)
    if (isNative()) {
      window.Capacitor.Plugins?.Widget?.update?.({ data: payload }).catch(()=>{})
    }
  } catch (e) {
    console.warn('updateWidgetData error:', e)
  }
}
