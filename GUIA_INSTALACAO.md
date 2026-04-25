# 📱 Life Planner v3 — Guia de Instalação Completo

---

## Novidades desta versão
- ✅ **Notificações** de tarefas (horário agendável por tarefa)
- 📅 **Widget de calendário** para tela inicial (Android e iPhone)
- 👥 **Gerenciamento completo de grupo** no perfil
- 🔐 Login com Google via redirect (sem erro COOP)

---

## PARTE 1 — Configurar e publicar (obrigatório)

### Passo 1: Node.js
Acesse **https://nodejs.org** → botão LTS → instale → reinicie o PC.

### Passo 2: Instalar dependências
```bash
npm install
```

### Passo 3: Configurar Firebase
Abra `src/firebase.js` e substitua os `COLE_AQUI...` com seus valores.
Veja o GUIA_INSTALACAO.md para criar o projeto Firebase do zero.

### Passo 4: Build e publicar
```bash
npm run build
```
Arraste a pasta `dist` para **https://netlify.com** → deploy manual.

### Passo 5: Autorizar domínio no Firebase
Firebase Console → Authentication → Settings → Authorized domains → Add domain
→ cole `seu-site.netlify.app`

---

## PARTE 2 — Notificações de tarefas

### No app PWA (navegador/celular via link)
As notificações funcionam via Web Notifications API.
Quando abrir o app pela primeira vez, aparecerá um banner amarelo:
**"Ative notificações para lembretes de tarefas"** → toque em **Ativar**.

O navegador pedirá permissão → toque em **Permitir**.

Ao criar uma tarefa, o campo **"🔔 Lembrete às"** permite escolher o horário.

### No app nativo (Android/iOS via Capacitor)
As notificações nativas são mais confiáveis (funcionam com o app fechado).
Siga a PARTE 3 abaixo para empacotar como app nativo.

---

## PARTE 3 — Empacotar como app nativo (Android / iOS)

### Pré-requisitos
```bash
# Instalar Capacitor CLI globalmente
npm install -g @capacitor/cli

# Adicionar plataformas
npx cap add android
npx cap add ios       # apenas no Mac

# Sincronizar após cada build
npm run build
npx cap sync
```

### Android
```bash
npx cap open android
```
→ Android Studio abre. Clique ▶ Run para testar no celular.

### iOS (apenas Mac)
```bash
npx cap open ios
```
→ Xcode abre. Clique ▶ Run para testar no iPhone.

---

## PARTE 4 — Widget de calendário no Android

### O que você precisa
- Android Studio instalado
- Projeto aberto: `npx cap open android`

### Passo a passo

**1. Copie os arquivos do widget:**
```
android-widget/CalendarWidget.java
  → android/app/src/main/java/com/lifeplanner/app/CalendarWidget.java

android-widget/res/layout/widget_calendar.xml
  → android/app/src/main/res/layout/widget_calendar.xml

android-widget/res/xml/widget_info.xml
  → android/app/src/main/res/xml/widget_info.xml
```

**2. Abra o AndroidManifest.xml:**
Arquivo: `android/app/src/main/AndroidManifest.xml`

Adicione as permissões ANTES de `<application>`:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
```

Adicione o receiver DENTRO de `<application>`, após o `<activity>`:
```xml
<receiver android:name=".CalendarWidget" android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE"/>
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_info"/>
</receiver>
```

**3. Adicione ícone:**
Em `android/app/src/main/res/drawable/`, crie um arquivo `ic_calendar.xml`
(pode ser um vector asset simples de calendário — o Android Studio tem vários prontos:
New → Vector Asset → procure "event").

**4. Rebuild e instale no celular:**
No Android Studio → Build → Rebuild Project → ▶ Run

**5. Adicione o widget à tela inicial:**
- Pressione e segure na tela inicial do Android
- Toque em "Widgets"
- Procure "Life Planner"
- Arraste o widget "Calendário" para a tela
- O widget mostra automaticamente os eventos de hoje do app ✅

**Como funciona:**
O app web salva os eventos de hoje no armazenamento local.
O widget Android lê esses dados e exibe na tela inicial.
Toque no widget → abre o app direto na aba Calendário.

---

## PARTE 5 — Widget de calendário no iPhone (iOS)

### O que você precisa
- Mac com Xcode instalado
- Projeto aberto: `npx cap open ios`

### Passo a passo

**1. Criar a extensão de widget no Xcode:**
- Menu: File → New → Target
- Escolha: **Widget Extension**
- Nome: `CalendarWidget`
- Language: Swift
- Include Configuration App Intent: **NÃO** (desmarque)
- Clique Finish → Activate

**2. Substituir o código gerado:**
- No painel esquerdo do Xcode, abra a pasta `CalendarWidget`
- Selecione o arquivo `.swift` gerado
- Substitua TODO o conteúdo pelo código do arquivo `ios-widget/CalendarWidget.swift`

**3. Configurar App Groups (comunicação app ↔ widget):**

Para o target do APP PRINCIPAL:
- Selecione o projeto no painel esquerdo
- Clique no target "App"
- Aba "Signing & Capabilities"
- Clique em "+ Capability"
- Adicione: **App Groups**
- Clique em "+" e adicione: `group.com.lifeplanner.app`

Repita para o target "CalendarWidget":
- Clique no target "CalendarWidget"
- Aba "Signing & Capabilities"
- Adicione App Groups
- Selecione o mesmo grupo: `group.com.lifeplanner.app`

**4. Adicione bridge no AppDelegate.swift:**
No arquivo `ios/App/App/AppDelegate.swift`, adicione dentro de
`application(_:didFinishLaunchingWithOptions:)`:
```swift
// Sincroniza dados do app com o widget
if let data = UserDefaults.standard.string(forKey: "lp_widget_data") {
    UserDefaults(suiteName: "group.com.lifeplanner.app")?.set(data, forKey: "lp_widget_data")
}
WidgetCenter.shared.reloadAllTimelines()
```

**5. Build e teste:**
- Selecione seu iPhone no topo do Xcode
- Clique ▶ Run
- Aguarde instalar

**6. Adicione o widget à tela inicial do iPhone:**
- Pressione e segure na tela inicial
- Toque no "+" no canto superior esquerdo
- Procure "Life Planner"
- Selecione o widget "Calendário"
- Escolha tamanho (pequeno ou médio)
- Toque em "Adicionar widget" ✅

---

## PARTE 6 — Regras do Firestore (obrigatório para gerenciamento de grupo)

No Firebase Console → Firestore → Regras → substitua tudo por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    match /groups/{groupId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.members.map(m, m.uid);
    }

    match /groups/{groupId}/{document=**} {
      allow read, write: if request.auth != null
        && exists(/databases/$(database)/documents/groups/$(groupId))
        && request.auth.uid in
           get(/databases/$(database)/documents/groups/$(groupId))
           .data.members.map(m, m.uid);
    }

    match /invites/{email} {
      allow read:  if request.auth != null && request.auth.token.email == email;
      allow write: if request.auth != null;
    }
  }
}
```

Clique em **Publicar**.

---

## Resumo de arquivos importantes

| Arquivo | Para que serve |
|---------|---------------|
| `src/firebase.js` | Credenciais do Firebase — preencha antes de tudo |
| `android-widget/CalendarWidget.java` | Widget Android — copie para o projeto nativo |
| `android-widget/res/layout/widget_calendar.xml` | Layout do widget Android |
| `android-widget/res/xml/widget_info.xml` | Config do widget Android |
| `ios-widget/CalendarWidget.swift` | Widget iOS — cole no Xcode |
| `netlify.toml` | Config do Netlify com correção COOP do login |
| `public/_headers` | Headers de segurança para o Netlify |

---

## Dúvidas?
Me informe o passo em que travou e o erro exato — resolvo na hora! 🚀
