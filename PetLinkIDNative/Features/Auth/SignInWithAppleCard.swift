import SwiftUI
import AuthenticationServices

struct SignInWithAppleCard: View {
    let onSignedIn: (String) -> Void
    @State private var errorMessage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Sign in to PetLinkID")
                .font(.title2.bold())

            Text("Use Sign in with Apple to keep your pet records private and synced across your Apple devices.")
                .foregroundStyle(.secondary)

            SignInWithAppleButton(.signIn, onRequest: { request in
                request.requestedScopes = [.fullName, .email]
            }, onCompletion: handleSignIn(result:))
            .signInWithAppleButtonStyle(.black)
            .frame(height: 50)

            if let errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
                    .font(.footnote)
            }

            Text("If iCloud is unavailable on this device, sync and sharing features may be limited.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }

    private func handleSignIn(result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let auth):
            guard let credential = auth.credential as? ASAuthorizationAppleIDCredential else {
                errorMessage = "Could not read Apple credentials."
                return
            }
            onSignedIn(credential.user)
        case .failure(let error):
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    SignInWithAppleCard(onSignedIn: { _ in })
        .padding()
}
