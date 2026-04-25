// CalendarWidget.swift
// Widget de Calendário do Life Planner para iOS (WidgetKit — iOS 14+)
//
// COMO INSTALAR:
// 1. No Xcode, abra o projeto iOS (npx cap open ios)
// 2. File → New → Target → Widget Extension
// 3. Nome: "CalendarWidget" → Finish → Activate
// 4. Substitua o conteúdo do arquivo gerado pelo código abaixo
// 5. Em "App Groups": selecione o target do app principal →
//    Signing & Capabilities → + Capability → App Groups →
//    Adicione: "group.com.lifeplanner.app"
//    Faça o mesmo para o target CalendarWidget
// 6. Build & Run

import WidgetKit
import SwiftUI

// ── Modelo de evento ──────────────────────────────────────────────────────────
struct CalEvent: Identifiable, Codable {
    var id    = UUID()
    var title: String
    var time:  String
    var color: String
    var done:  Bool
    var allDay: Bool
}

// ── Lê dados do App Group (escritos pelo app web via localStorage bridge) ─────
struct WidgetDataProvider {
    static let groupID = "group.com.lifeplanner.app"
    static let key     = "lp_widget_data"

    static func load() -> [CalEvent] {
        guard
            let defaults = UserDefaults(suiteName: groupID),
            let jsonStr  = defaults.string(forKey: key),
            let data     = jsonStr.data(using: .utf8),
            let obj      = try? JSONSerialization.jsonObject(with: data) as? [String:Any],
            let evArray  = obj["events"] as? [[String:Any]]
        else { return [] }

        return evArray.prefix(6).compactMap { ev in
            guard let title = ev["title"] as? String else { return nil }
            return CalEvent(
                title:  title,
                time:   ev["time"]   as? String ?? "",
                color:  ev["color"]  as? String ?? "#534AB7",
                done:   ev["done"]   as? Bool   ?? false,
                allDay: ev["allDay"] as? Bool   ?? false
            )
        }
    }
}

// ── Timeline entry ────────────────────────────────────────────────────────────
struct CalEntry: TimelineEntry {
    let date:   Date
    let events: [CalEvent]
}

// ── Provider ──────────────────────────────────────────────────────────────────
struct CalProvider: TimelineProvider {
    func placeholder(in context: Context) -> CalEntry {
        CalEntry(date: .now, events: [
            CalEvent(title:"Reunião de equipe", time:"09:00", color:"#534AB7", done:false, allDay:false),
            CalEvent(title:"Academia",          time:"18:00", color:"#0F6E56", done:true,  allDay:false),
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (CalEntry) -> Void) {
        completion(CalEntry(date: .now, events: WidgetDataProvider.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalEntry>) -> Void) {
        let entry    = CalEntry(date: .now, events: WidgetDataProvider.load())
        // Atualiza de hora em hora
        let nextDate = Calendar.current.date(byAdding: .hour, value: 1, to: .now)!
        completion(Timeline(entries: [entry], policy: .after(nextDate)))
    }
}

// ── Views ─────────────────────────────────────────────────────────────────────
struct EventRow: View {
    let event: CalEvent
    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(Color(hex: event.color))
                .frame(width: 7, height: 7)
            Text(event.done ? "✓ \(event.title)" : event.title)
                .font(.system(size: 12))
                .foregroundColor(event.done ? .secondary : .primary)
                .lineLimit(1)
            Spacer()
            Text(event.allDay ? "Dia inteiro" : event.time)
                .font(.system(size: 10))
                .foregroundColor(.secondary)
        }
    }
}

struct CalWidgetView: View {
    let entry: CalEntry
    @Environment(\.widgetFamily) var family

    var dayNum:  String { Calendar.current.component(.day, from: entry.date).description }
    var weekday: String {
        let f = DateFormatter(); f.locale = Locale(identifier:"pt_BR"); f.dateFormat = "EEEE"
        return f.string(from: entry.date).capitalized
    }
    var monthYear: String {
        let f = DateFormatter(); f.locale = Locale(identifier:"pt_BR"); f.dateFormat = "MMMM yyyy"
        return f.string(from: entry.date).capitalized
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(dayNum)
                    .font(.system(size: 30, weight: .bold))
                    .foregroundColor(Color(hex: "#534AB7"))
                VStack(alignment: .leading, spacing: 1) {
                    Text(weekday.uppercased())
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(Color(hex: "#534AB7"))
                    Text(monthYear)
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                }
                Spacer()
            }
            .padding(.bottom, 6)

            Divider().padding(.bottom, 6)

            if entry.events.isEmpty {
                Text("Nenhum evento hoje")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                Spacer()
            } else {
                let maxRows = family == .systemSmall ? 3 : 5
                ForEach(entry.events.prefix(maxRows)) { ev in
                    EventRow(event: ev)
                        .padding(.bottom, 4)
                }
                Spacer()
            }
        }
        .padding(12)
    }
}

// ── Widget declaration ────────────────────────────────────────────────────────
@main
struct CalendarWidget: Widget {
    let kind = "CalendarWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalProvider()) { entry in
            CalWidgetView(entry: entry)
                .containerBackground(.background, for: .widget)
        }
        .configurationDisplayName("Calendário")
        .description("Veja seus eventos de hoje na tela inicial.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// ── Hex color helper ──────────────────────────────────────────────────────────
extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet(charactersIn:"#"))
        var rgb: UInt64 = 0
        Scanner(string: h).scanHexInt64(&rgb)
        self.init(
            .sRGB,
            red:   Double((rgb >> 16) & 0xFF) / 255,
            green: Double((rgb >> 8)  & 0xFF) / 255,
            blue:  Double( rgb        & 0xFF) / 255
        )
    }
}
