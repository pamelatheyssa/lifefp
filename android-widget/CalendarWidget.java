package com.lifeplanner.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Widget de Calendário do Life Planner para Android.
 *
 * COMO INSTALAR:
 * 1. Copie este arquivo para:
 *    android/app/src/main/java/com/lifeplanner/app/CalendarWidget.java
 *
 * 2. Adicione no AndroidManifest.xml, dentro de <application>:
 *
 *    <receiver android:name=".CalendarWidget" android:exported="true">
 *      <intent-filter>
 *        <action android:name="android.appwidget.action.APPWIDGET_UPDATE"/>
 *      </intent-filter>
 *      <meta-data
 *        android:name="android.appwidget.provider"
 *        android:resource="@xml/widget_info"/>
 *    </receiver>
 *
 * 3. Copie widget_info.xml para android/app/src/main/res/xml/
 * 4. Copie widget_calendar.xml para android/app/src/main/res/layout/
 * 5. Rebuild: npx cap sync android
 */
public class CalendarWidget extends AppWidgetProvider {

    private static final String PREFS_NAME = "LifePlannerWidgetPrefs";
    private static final String KEY_DATA   = "lp_widget_data";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId);
        }
    }

    public static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_calendar);

        // ── Data de hoje ─────────────────────────────────────────────────────
        Calendar cal      = Calendar.getInstance();
        String dayNumber  = String.valueOf(cal.get(Calendar.DAY_OF_MONTH));
        String weekday    = new SimpleDateFormat("EEEE", new Locale("pt","BR"))
                               .format(new Date()).toUpperCase();
        String monthYear  = new SimpleDateFormat("MMMM yyyy", new Locale("pt","BR"))
                               .format(new Date());

        views.setTextViewText(R.id.widget_day_number, dayNumber);
        views.setTextViewText(R.id.widget_weekday,    weekday);
        views.setTextViewText(R.id.widget_month_year, monthYear);

        // ── Eventos do localStorage (escritos pelo app web) ───────────────────
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String jsonData = prefs.getString(KEY_DATA, "");

        int[] titleIds = { R.id.widget_title_1, R.id.widget_title_2, R.id.widget_title_3, R.id.widget_title_4 };
        int[] timeIds  = { R.id.widget_time_1,  R.id.widget_time_2,  R.id.widget_time_3,  R.id.widget_time_4  };
        int[] rowIds   = { R.id.widget_event_1, R.id.widget_event_2, R.id.widget_event_3, R.id.widget_event_4 };
        int[] dotIds   = { R.id.widget_dot_1,   R.id.widget_dot_2,   R.id.widget_dot_3,   R.id.widget_dot_4   };

        // Esconde tudo por padrão
        for (int rowId : rowIds) views.setViewVisibility(rowId, View.GONE);
        views.setViewVisibility(R.id.widget_no_events, View.VISIBLE);

        try {
            if (!jsonData.isEmpty()) {
                JSONObject data   = new JSONObject(jsonData);
                JSONArray  events = data.getJSONArray("events");
                int count = Math.min(events.length(), 4);

                if (count > 0) {
                    views.setViewVisibility(R.id.widget_no_events, View.GONE);
                    for (int i = 0; i < count; i++) {
                        JSONObject ev    = events.getJSONObject(i);
                        String title     = ev.optString("title", "");
                        String time      = ev.optBoolean("allDay") ? "Dia inteiro" : ev.optString("time","");
                        String colorHex  = ev.optString("color","#534AB7");
                        boolean done     = ev.optBoolean("done", false);

                        views.setViewVisibility(rowIds[i], View.VISIBLE);
                        views.setTextViewText(titleIds[i], done ? "✓ "+title : title);
                        views.setTextViewText(timeIds[i],  time);

                        try {
                            views.setInt(dotIds[i], "setBackgroundColor", Color.parseColor(colorHex));
                        } catch (Exception ignored) {}
                    }
                }
            }
        } catch (Exception e) {
            // JSON inválido — mantém tela "Nenhum evento"
        }

        // ── Toque abre o app na aba Calendário ────────────────────────────────
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("tab", "calendar");
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_day_number, pendingIntent);

        manager.updateAppWidget(widgetId, views);
    }

    // Chamado pelo Capacitor plugin quando os dados mudam
    public static void notifyDataChanged(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        android.content.ComponentName comp =
            new android.content.ComponentName(context, CalendarWidget.class);
        int[] ids = manager.getAppWidgetIds(comp);
        for (int id : ids) updateWidget(context, manager, id);
    }
}
