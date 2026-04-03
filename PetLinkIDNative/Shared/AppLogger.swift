import OSLog

enum AppLogger {
    static let persistence = Logger(subsystem: "com.petlinkid.app", category: "Persistence")
    static let sync = Logger(subsystem: "com.petlinkid.app", category: "CloudKitSync")
    static let sharing = Logger(subsystem: "com.petlinkid.app", category: "Sharing")
}
