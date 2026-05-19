import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Safe, recursive dummy mock client that returns resolved promises on any chained calls
// to prevent crashes on deployed sites when environment variables are not yet configured.
const createMockClient = (): any => {
  const handler = {
    get: (target: any, prop: string): any => {
      // Return a mock function that enables infinite chaining
      const mockFn = () => {
        const promiseResult = Promise.resolve({ 
          data: null, 
          error: { message: "Supabase is not configured. Cloud sync is disabled." } 
        })
        
        // Wrap the promise with a proxy so chained builders like .eq() or .select() work
        return new Proxy(promiseResult, handler)
      }
      
      // If we are accessing standard Promise methods (.then, .catch, .finally), bind and return them
      if (prop === "then" || prop === "catch" || prop === "finally") {
        return target[prop] ? target[prop].bind(target) : mockFn
      }
      
      return new Proxy(mockFn, handler)
    }
  }
  return new Proxy({}, handler)
}

// Only initialize Supabase if credentials are valid and absolute URLs
export const supabase = (supabaseUrl && supabaseUrl.startsWith("http") && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()
