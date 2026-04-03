import CoreData

enum CoreDataModelBuilder {
    static func makeModel() -> NSManagedObjectModel {
        let model = NSManagedObjectModel()

        let pet = makePetEntity()
        let vaccination = makeChildEntity(name: "Vaccination", className: "Vaccination", fields: [
            attr("name", .stringAttributeType),
            attr("administeredOn", .dateAttributeType, optional: true),
            attr("dueOn", .dateAttributeType, optional: true),
            attr("notes", .stringAttributeType, optional: true)
        ])
        let medication = makeChildEntity(name: "Medication", className: "Medication", fields: [
            attr("name", .stringAttributeType), attr("dosage", .stringAttributeType, optional: true),
            attr("startDate", .dateAttributeType, optional: true), attr("endDate", .dateAttributeType, optional: true),
            attr("notes", .stringAttributeType, optional: true)
        ])
        let allergy = makeChildEntity(name: "Allergy", className: "Allergy", fields: [
            attr("allergen", .stringAttributeType), attr("severity", .stringAttributeType, optional: true),
            attr("reactionNotes", .stringAttributeType, optional: true)
        ])
        let vetContact = makeChildEntity(name: "VetContact", className: "VetContact", fields: [
            attr("clinicName", .stringAttributeType), attr("veterinarianName", .stringAttributeType, optional: true),
            attr("phone", .stringAttributeType, optional: true), attr("email", .stringAttributeType, optional: true),
            attr("address", .stringAttributeType, optional: true), attr("notes", .stringAttributeType, optional: true)
        ])
        let emergency = makeChildEntity(name: "EmergencyContact", className: "EmergencyContact", fields: [
            attr("name", .stringAttributeType), attr("relationshipLabel", .stringAttributeType, optional: true),
            attr("phone", .stringAttributeType, optional: true), attr("email", .stringAttributeType, optional: true)
        ])
        let insurance = makeChildEntity(name: "InsurancePolicy", className: "InsurancePolicy", fields: [
            attr("providerName", .stringAttributeType), attr("policyNumber", .stringAttributeType, optional: true),
            attr("renewalDate", .dateAttributeType, optional: true), attr("notes", .stringAttributeType, optional: true)
        ])
        let registration = makeChildEntity(name: "RegistrationRecord", className: "RegistrationRecord", fields: [
            attr("authorityName", .stringAttributeType), attr("registrationNumber", .stringAttributeType, optional: true),
            attr("expiryDate", .dateAttributeType, optional: true), attr("notes", .stringAttributeType, optional: true)
        ])
        let reminder = makeChildEntity(name: "Reminder", className: "Reminder", fields: [
            attr("title", .stringAttributeType), attr("type", .stringAttributeType, optional: true),
            attr("dueDate", .dateAttributeType, optional: true), attr("notes", .stringAttributeType, optional: true),
            attr("isCompleted", .booleanAttributeType, defaultValue: false)
        ])
        let attachment = makeChildEntity(name: "Attachment", className: "Attachment", fields: [
            attr("fileName", .stringAttributeType), attr("utiType", .stringAttributeType, optional: true),
            attr("fileSizeBytes", .integer64AttributeType, defaultValue: 0),
            attr("cloudAssetIdentifier", .stringAttributeType, optional: true),
            attr("localBookmarkData", .binaryDataAttributeType, optional: true)
        ])

        let userProfile = NSEntityDescription()
        userProfile.name = "UserProfile"
        userProfile.managedObjectClassName = "UserProfile"
        userProfile.properties = [
            attr("id", .UUIDAttributeType),
            attr("appleUserID", .stringAttributeType),
            attr("displayName", .stringAttributeType, optional: true),
            attr("createdAt", .dateAttributeType),
            attr("updatedAt", .dateAttributeType)
        ]

        wireToPet(parent: pet, children: [
            (vaccination, "vaccinations"),
            (medication, "medications"),
            (allergy, "allergies"),
            (vetContact, "vetContacts"),
            (emergency, "emergencyContacts"),
            (insurance, "insurancePolicies"),
            (registration, "registrationRecords"),
            (reminder, "reminders"),
            (attachment, "attachments")
        ])

        model.entities = [pet, vaccination, medication, allergy, vetContact, emergency, insurance, registration, reminder, attachment, userProfile]
        return model
    }

    private static func makePetEntity() -> NSEntityDescription {
        let entity = NSEntityDescription()
        entity.name = "Pet"
        entity.managedObjectClassName = "Pet"
        entity.properties = [
            attr("id", .UUIDAttributeType),
            attr("name", .stringAttributeType),
            attr("profilePhotoData", .binaryDataAttributeType, optional: true),
            attr("species", .stringAttributeType),
            attr("breed", .stringAttributeType, optional: true),
            attr("sex", .stringAttributeType, optional: true),
            attr("dateOfBirth", .dateAttributeType, optional: true),
            attr("approximateAgeYears", .integer16AttributeType, defaultValue: 0),
            attr("microchipNumber", .stringAttributeType, optional: true),
            attr("isDesexed", .booleanAttributeType, defaultValue: false),
            attr("identifyingMarks", .stringAttributeType, optional: true),
            attr("weightKg", .doubleAttributeType, defaultValue: 0),
            attr("notes", .stringAttributeType, optional: true),
            attr("ownerInternalNotes", .stringAttributeType, optional: true),
            attr("ownerAppleUserID", .stringAttributeType, optional: true),
            attr("isShared", .booleanAttributeType, defaultValue: false),
            attr("sharePermissionRaw", .integer16AttributeType, defaultValue: 0),
            attr("createdAt", .dateAttributeType),
            attr("updatedAt", .dateAttributeType)
        ]
        return entity
    }

    private static func makeChildEntity(name: String, className: String, fields: [NSAttributeDescription]) -> NSEntityDescription {
        let entity = NSEntityDescription()
        entity.name = name
        entity.managedObjectClassName = className

        var properties = fields
        properties.append(contentsOf: [
            attr("id", .UUIDAttributeType),
            attr("createdAt", .dateAttributeType),
            attr("updatedAt", .dateAttributeType)
        ])
        entity.properties = properties
        return entity
    }

    private static func wireToPet(parent: NSEntityDescription, children: [(NSEntityDescription, String)]) {
        for (child, parentCollectionName) in children {
            let toPet = NSRelationshipDescription()
            toPet.name = "pet"
            toPet.destinationEntity = parent
            toPet.minCount = 0
            toPet.maxCount = 1
            toPet.deleteRule = .nullifyDeleteRule

            let fromPet = NSRelationshipDescription()
            fromPet.name = parentCollectionName
            fromPet.destinationEntity = child
            fromPet.minCount = 0
            fromPet.maxCount = 0
            fromPet.isToMany = true
            fromPet.deleteRule = .cascadeDeleteRule

            toPet.inverseRelationship = fromPet
            fromPet.inverseRelationship = toPet

            child.properties.append(toPet)
            parent.properties.append(fromPet)
        }
    }

    private static func attr(
        _ name: String,
        _ type: NSAttributeType,
        optional: Bool = false,
        defaultValue: Any? = nil
    ) -> NSAttributeDescription {
        let description = NSAttributeDescription()
        description.name = name
        description.attributeType = type
        description.isOptional = optional
        description.defaultValue = defaultValue
        return description
    }
}
