import { createContext, useContext } from "react";
import { ClerkProvider, useAuth as useClerkAuth, useUser, SignInButton, UserButton } from "@clerk/clerk-react";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const AuthContext = createContext({
  isConfigured: false,
  isSignedIn: false,
  user: null,
  getToken: async () => null,
});

function ClerkBridge({ children }) {
  const { isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  return (
    <AuthContext.Provider
      value={{
        isConfigured: true,
        isSignedIn: !!isSignedIn,
        user,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Envuelve la app con Clerk si hay clave configurada. Si no, la app sigue
// funcionando en modo "solo exploración" (sin login) — ver
// frontend/.env.example para configurar VITE_CLERK_PUBLISHABLE_KEY.
export function AppAuthProvider({ children }) {
  if (!clerkKey) {
    return (
      <AuthContext.Provider
        value={{ isConfigured: false, isSignedIn: false, user: null, getToken: async () => null }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}

export function AuthAction() {
  const { isConfigured } = useAppAuth();
  if (!isConfigured) {
    return (
      <span
        className="rounded-full border border-earth/20 px-3 py-1.5 text-xs text-earth"
        title="Configurá VITE_CLERK_PUBLISHABLE_KEY para habilitar el login"
      >
        Modo exploración
      </span>
    );
  }
  return (
    <>
      <SignInButtonSlot />
    </>
  );
}

function SignInButtonSlot() {
  const { isSignedIn } = useAppAuth();
  if (isSignedIn) return <UserButton afterSignOutUrl="/" />;
  return (
    <SignInButton mode="modal">
      <button className="min-h-[40px] rounded-full bg-carbon px-4 text-sm font-medium text-bone hover:bg-earth transition-colors">
        Iniciar sesión
      </button>
    </SignInButton>
  );
}
