# Push Notifications Background Mode Justification

We intentionally keep `UIBackgroundModes` -> `remote-notification` in `ios/App/App/Info.plist` because the iOS app supports push notifications for user-facing reminders and account updates. The background mode allows the app to receive remote notifications (including silent updates) and forward them to Capacitor while the app is not active.

## User value
- Deliver proactive pet-care reminders (vaccinations, medications, vet appointments, flea/tick treatments) even when the app is not open.
- Send account- and subscription-related alerts so users can act on plan or billing changes without missing critical notices.

## Technical implementation
- The app uses `@capacitor/push-notifications` with `UNUserNotificationCenter` delegation to display alerts in the foreground and route taps back into the web experience.
- `AppDelegate.swift` now forwards `application(_:didReceiveRemoteNotification:fetchCompletionHandler:)` to `ApplicationDelegateProxy` so remote notifications are acknowledged and dispatched correctly when the app is in the background.

## Privacy and user control
- Push delivery is opt-in: registration occurs only after the user grants notification permission in-app.
- Notifications contain only reminder metadata and do not include location tracking or other sensitive data.
