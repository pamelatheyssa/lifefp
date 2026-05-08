// ─── Serviço de Notificações ─────────────────────────────────────────────────
let _plugin = null

export const isNative = () =>
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

function makeNotifId(seed) {
  if (seed && typeof seed === 'number' && seed > 0 && seed < 2147483647) return seed
  return Math.floor(Math.random() * 2000000000) + 1
}

// ── Permissions ──────────────────────────────────────────────────────────────
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

export async function checkNotificationPermission() {
  if (isNative()) {
    const plugin = await getPlugin()
    if (plugin) {
      const { display } = await plugin.checkPermissions()
      return display === 'granted'
    }
  }
  return 'Notification' in window && Notification.permission === 'granted'
}

// ── Task notifications ────────────────────────────────────────────────────────
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
        await plugin.cancel({ notifications: [{ id: notifId }] }).catch(()=>{})
        await plugin.schedule({
          notifications: [{
            id:       notifId,
            title:    '✅ Life Planner — Tarefa',
            body:     title + (body ? `\n${body}` : ''),
            schedule: { at: fireAt, allowWhileIdle: true },
            sound:    'default',
            smallIcon:'ic_stat_icon_config_sample',
            iconColor:'#534AB7',
          }]
        })
      } catch (e) { console.error('Erro ao agendar notificação:', e) }
      return
    }
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    const delay = fireAt.getTime() - Date.now()
    if (delay > 0 && delay < 86400000 * 7) {
      setTimeout(() => new Notification('✅ Life Planner', {
        body: title, icon: '/icon-192.png', tag: `task-${notifId}`, renotify: true
      }), delay)
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
  } catch (e) { console.warn('rescheduleAll error:', e) }
}

// ── Water reminders ───────────────────────────────────────────────────────────
const WATER_BASE_ID = 900000000

export async function scheduleWaterReminder({ intervalMinutes, consumed, goal }) {
  if (!isNative()) return
  const plugin = await getPlugin()
  if (!plugin) return
  try {
    const { display } = await plugin.checkPermissions()
    if (display !== 'granted') return

    // Cancel existing
    const toCancel = Array.from({length:61},(_,i)=>({id:WATER_BASE_ID+i}))
    await plugin.cancel({ notifications: toCancel }).catch(()=>{})

    if (consumed >= goal) return

    const now  = new Date()
    const notifications = []
    let fireAt = new Date(now.getTime() + intervalMinutes*60*1000)
    const end  = new Date(now.getTime() + 16*60*60*1000) // schedule up to 16h ahead
    let i = 0

    while (fireAt < end && i < 60) {
      notifications.push({
        id:       WATER_BASE_ID + i,
        title:    '💧 Hora de beber água!',
        body:     `Você bebeu ${consumed}ml de ${goal}ml hoje. Tome mais um copo!`,
        schedule: { at: new Date(fireAt), allowWhileIdle: true },
        sound:    'default',
        smallIcon:'ic_stat_icon_config_sample',
        iconColor:'#0288D1',
      })
      fireAt = new Date(fireAt.getTime() + intervalMinutes*60*1000)
      i++
    }

    if (notifications.length > 0) await plugin.schedule({ notifications })
  } catch (e) { console.warn('scheduleWaterReminder error:', e) }
}

export async function cancelWaterReminders() {
  if (!isNative()) return
  const plugin = await getPlugin()
  if (!plugin) return
  try {
    const toCancel = Array.from({length:61},(_,i)=>({id:WATER_BASE_ID+i}))
    await plugin.cancel({ notifications: toCancel }).catch(()=>{})
  } catch(e) { console.warn('cancelWaterReminders error:', e) }
}

// ── Widget ────────────────────────────────────────────────────────────────────
export function updateWidgetData(events) {
  try {
    const today   = new Date().toISOString().split('T')[0]
    const todayEv = (events||[])
      .filter(e=>e.date===today)
      .sort((a,b)=>(a.time||'').localeCompare(b.time||''))
      .slice(0,8)
      .map(e=>({title:e.title,time:e.time,color:e.color,done:e.done,allDay:e.allDay}))
    const payload = JSON.stringify({date:today,events:todayEv,updatedAt:Date.now()})
    localStorage.setItem('lp_widget_data', payload)
    if (isNative()) window.Capacitor.Plugins?.Widget?.update?.({data:payload}).catch(()=>{})
  } catch(e) { console.warn('updateWidgetData error:', e) }
}
