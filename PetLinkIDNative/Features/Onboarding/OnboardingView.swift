import SwiftUI

struct OnboardingView: View {
    let onContinue: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Spacer()
            Image(systemName: "cross.case.fill")
                .font(.system(size: 54))
                .foregroundStyle(.tint)

            Text("Welcome to PetLinkID")
                .font(.largeTitle.bold())

            Text("Store important pet records safely on your Apple devices. Sync with iCloud and share trusted pet profiles when needed.")
                .font(.body)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 10) {
                Label("Private-by-default iCloud sync", systemImage: "lock.shield")
                Label("Simple profile sharing for families", systemImage: "person.2")
                Label("Structured pet passport records", systemImage: "doc.text")
            }
            .font(.subheadline)

            Spacer()

            Button("Continue") {
                onContinue()
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .frame(maxWidth: .infinity, alignment: .center)
        }
        .padding(24)
    }
}

#Preview {
    OnboardingView(onContinue: {})
}
