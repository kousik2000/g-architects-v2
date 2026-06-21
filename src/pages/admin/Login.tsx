import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/appStore"
import { ShieldCheck, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const { login, token, loading } = useAuthStore()

  const [email, setEmail] = useState("admin@garchitects.com")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (token) {
      navigate("/admin")
    }
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    const success = await login({ email, password })
    if (success) {
      navigate("/admin")
    } else {
      setErrorMsg("Invalid email or password.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-body">
      {/* Absolute decorative geometry shapes */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] border border-accent/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] border border-primary/5 rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-borderLine shadow-architectural rounded-architectural p-8 md:p-10 z-10 overflow-hidden">
        
        {/* Top Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center justify-center gap-1.5 mb-4 select-none">
            <img src="/src/store/logov1-g.png" className="h-[35px] object-contain mr-[2px]" />
            <span className="text-accent text-xl font-extrabold mb-[-4px]">.</span>
            <div className="flex flex-col text-left text-xs font-headings font-extrabold leading-none text-primary tracking-tight">
              <div className="flex gap-1 items-center">
                <span>ARCHITECTS</span>
                <span className="text-accent">&</span>
              </div>
              <span>CONSULTANTS</span>
            </div>
          </div>
          <span className="text-[9px] uppercase font-bold text-accent tracking-widest font-headings mb-1 block">
            Developer Admin Portal
          </span>
          <h2 className="font-headings text-xl font-bold tracking-tight text-primary">
            Admin Authentication
          </h2>
          <p className="text-xs text-mutedText mt-1 font-light">
            Please authenticate using authorized supervisor credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-borderLine text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent font-medium text-primary"
              placeholder="supervisor@garchitects.com"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-mutedText tracking-wider block mb-1">
              Secret Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-borderLine text-xs rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-accent font-medium text-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedText hover:text-primary p-0.5"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white uppercase text-xs font-bold tracking-widest rounded-architectural hover:bg-accent transition-colors duration-300 disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating session..." : "Verify Credentials"}
          </button>
        </form>

        <div className="mt-8 border-t border-borderLine pt-6 text-center">
          <span className="text-[10px] text-mutedText font-light">
            Pre-seeded test account: <code className="bg-background px-1.5 py-0.5 rounded font-mono">admin@garchitects.com</code> / <code className="bg-background px-1.5 py-0.5 rounded font-mono">admin123</code>
          </span>
        </div>
      </div>
    </div>
  )
}
