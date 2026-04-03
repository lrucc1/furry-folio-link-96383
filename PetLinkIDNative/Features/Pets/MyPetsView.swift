import SwiftUI
import CoreData

struct MyPetsView: View {
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Pet.updatedAt, ascending: false)],
        predicate: NSPredicate(format: "isShared == NO")
    ) private var pets: FetchedResults<Pet>

    var body: some View {
        List {
            if pets.isEmpty {
                ContentUnavailableView(
                    "No Pets Yet",
                    systemImage: "pawprint",
                    description: Text("Add your first pet profile to start building your pet passport.")
                )
            } else {
                ForEach(pets) { pet in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(pet.name ?? "Unnamed Pet")
                            .font(.headline)
                        Text(pet.breed ?? pet.species ?? "Unknown breed")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("My Pets")
    }
}

#Preview {
    NavigationStack {
        MyPetsView()
            .environment(\.managedObjectContext, PersistenceController.preview.viewContext)
    }
}
