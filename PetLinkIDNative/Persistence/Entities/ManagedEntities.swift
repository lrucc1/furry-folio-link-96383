import CoreData

@objc(Pet)
public final class Pet: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var name: String?
    @NSManaged public var profilePhotoData: Data?
    @NSManaged public var species: String?
    @NSManaged public var breed: String?
    @NSManaged public var sex: String?
    @NSManaged public var dateOfBirth: Date?
    @NSManaged public var approximateAgeYears: Int16
    @NSManaged public var microchipNumber: String?
    @NSManaged public var isDesexed: Bool
    @NSManaged public var identifyingMarks: String?
    @NSManaged public var weightKg: Double
    @NSManaged public var notes: String?
    @NSManaged public var ownerInternalNotes: String?
    @NSManaged public var ownerAppleUserID: String?
    @NSManaged public var isShared: Bool
    @NSManaged public var sharePermissionRaw: Int16
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?

    @NSManaged public var vaccinations: NSSet?
    @NSManaged public var medications: NSSet?
    @NSManaged public var allergies: NSSet?
    @NSManaged public var vetContacts: NSSet?
    @NSManaged public var emergencyContacts: NSSet?
    @NSManaged public var insurancePolicies: NSSet?
    @NSManaged public var registrationRecords: NSSet?
    @NSManaged public var reminders: NSSet?
    @NSManaged public var attachments: NSSet?
}

@objc(Vaccination)
public final class Vaccination: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var name: String?
    @NSManaged public var administeredOn: Date?
    @NSManaged public var dueOn: Date?
    @NSManaged public var notes: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(Medication)
public final class Medication: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var name: String?
    @NSManaged public var dosage: String?
    @NSManaged public var startDate: Date?
    @NSManaged public var endDate: Date?
    @NSManaged public var notes: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(Allergy)
public final class Allergy: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var allergen: String?
    @NSManaged public var severity: String?
    @NSManaged public var reactionNotes: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(VetContact)
public final class VetContact: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var clinicName: String?
    @NSManaged public var veterinarianName: String?
    @NSManaged public var phone: String?
    @NSManaged public var email: String?
    @NSManaged public var address: String?
    @NSManaged public var notes: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(EmergencyContact)
public final class EmergencyContact: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var name: String?
    @NSManaged public var relationshipLabel: String?
    @NSManaged public var phone: String?
    @NSManaged public var email: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(InsurancePolicy)
public final class InsurancePolicy: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var providerName: String?
    @NSManaged public var policyNumber: String?
    @NSManaged public var renewalDate: Date?
    @NSManaged public var notes: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(RegistrationRecord)
public final class RegistrationRecord: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var authorityName: String?
    @NSManaged public var registrationNumber: String?
    @NSManaged public var expiryDate: Date?
    @NSManaged public var notes: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(Reminder)
public final class Reminder: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var title: String?
    @NSManaged public var type: String?
    @NSManaged public var dueDate: Date?
    @NSManaged public var notes: String?
    @NSManaged public var isCompleted: Bool
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(Attachment)
public final class Attachment: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var fileName: String?
    @NSManaged public var utiType: String?
    @NSManaged public var fileSizeBytes: Int64
    @NSManaged public var cloudAssetIdentifier: String?
    @NSManaged public var localBookmarkData: Data?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
    @NSManaged public var pet: Pet?
}

@objc(UserProfile)
public final class UserProfile: NSManagedObject, Identifiable {
    @NSManaged public var id: UUID?
    @NSManaged public var appleUserID: String?
    @NSManaged public var displayName: String?
    @NSManaged public var createdAt: Date?
    @NSManaged public var updatedAt: Date?
}
