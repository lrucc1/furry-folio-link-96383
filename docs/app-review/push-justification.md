# Push Notifications Background Mode Justification

We intentionally keep `UIBackgroundModes` -> `remote-notification` in `ios/App/App/Info.plist` because the iOS app supports push notifications for user-facing reminders and account updates. The background mode allows the app to receive remote notifications (including silent updates) and forward them to Capacitor while the app is not active.

## User value
- Deliver proactive pet-care reminders (vaccinations, medications, vet appointments, flea/tick treatments) even when the app is not open.
- Send account- and subscription-related alerts so users can act on plan or billing changes without missing critical notices.

## Technical implementation
- The app uses `@capacitor/push-notifications` with `UNUserNotificationCenter` delegation to display alerts in the foreground and route taps back into the web experience.
- `AppDelegate.swift` forwards background remote notifications to the JavaScript layer via `NotificationCenter.default.post()` with the name `CapacitorDidReceiveRemoteNotification`. This allows Capacitor plugins and custom listeners to handle notifications while the app is backgrounded.
- Foreground notifications are displayed using `UNUserNotificationCenterDelegate` with banner, sound, and badge presentation.
- Notification taps are forwarded via `CapacitorPushNotificationActionPerformed` to route users to the appropriate screen.

## Notification flow
1. **Registration**: App requests push permission → iOS grants token → Token saved to `device_tokens` table
2. **Background delivery**: Remote notification arrives → `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)` posts to NotificationCenter → JS layer processes
3. **Foreground display**: Notification arrives while app active → `userNotificationCenter(_:willPresent:)` displays banner with sound/badge
4. **User interaction**: User taps notification → `userNotificationCenter(_:didReceive:)` forwards action to Capacitor → App navigates to relevant screen

## Privacy and user control
- Push delivery is opt-in: registration occurs only after the user grants notification permission in-app.
- Notifications contain only reminder metadata and do not include location tracking or other sensitive data.
