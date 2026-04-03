import SwiftUI
import CoreData

struct SharedWithMeView: View {
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Pet.updatedAt, ascending: false)],
        predicate: NSPredicate(format: "isShared == YES")
    ) private var sharedPets: FetchedResults<Pet>

    var body: some View {
        List {
            if sharedPets.isEmpty {
                ContentUnavailableView(
                    "Nothing Shared Yet",
                    systemImage: "person.2",
                    description: Text("Pet profiles shared with you will appear here.")
                )
            } else {
                ForEach(sharedPets) { pet in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(pet.name ?? "Unnamed Pet")
                            .font(.headline)
                        Text(permissionLabel(for: pet.sharePermissionRaw))
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("Shared With Me")
    }

    private func permissionLabel(for raw: Int16) -> String {
        raw == 1 ? "Can Edit" : "View Only"
    }
}

#Preview {
    NavigationStack {
        SharedWithMeView()
            .environment(\.managedObjectContext, PersistenceController.preview.viewContext)
    }
}
