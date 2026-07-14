import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  // @ts-ignore
  supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
  // @ts-ignore
  supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
} catch (e) {
  console.warn("Could not read import.meta.env", e);
}

let supabaseClient: any;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment variables.");
  }
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} catch (error: any) {
  console.warn("Supabase initialization caught: ", error.message);
  console.warn("Using smart fallback proxy to prevent blank white screen. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are inserted in Vercel / Hostinger settings.");

  // Fully-chainable dummy proxy to prevent app-wide crash
  const createDummyProxy = (): any => {
    const chainable: any = () => createDummyProxy();
    
    // Support Promise-like thenable resolution
    chainable.then = (onfulfilled?: any) => {
      return Promise.resolve({ data: [], error: null }).then(onfulfilled);
    };
    chainable.catch = (onrejected?: any) => {
      return Promise.resolve({ data: [], error: null }).catch(onrejected);
    };
    chainable.finally = (onfinally?: any) => {
      return Promise.resolve({ data: [], error: null }).finally(onfinally);
    };

    const fallbackHandler = {
      get(target: any, prop: string): any {
        if (prop === 'auth') {
          return {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured.") }),
            signOut: async () => ({ error: null }),
          };
        }
        if (prop === 'channel') {
          return () => ({
            on: () => ({ subscribe: () => ({}) }),
            subscribe: () => ({}),
          });
        }
        if (prop === 'storage') {
          return {
            from: () => ({
              upload: async () => ({ data: null, error: new Error("Supabase not configured.") }),
              getPublicUrl: () => ({ data: { publicUrl: "" } }),
              createBucket: async () => ({ data: null, error: new Error("Supabase not configured.") }),
              updateBucket: async () => ({ data: null, error: new Error("Supabase not configured.") }),
            })
          };
        }
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          return chainable[prop];
        }
        return () => createDummyProxy();
      }
    };
    return new Proxy(chainable, fallbackHandler);
  };
  supabaseClient = createDummyProxy();
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Compresses an image client-side if it is larger than 1.5MB to ensure it fits
 * within standard Supabase Storage limits and uploads faster.
 */
async function compressImageIfNeeded(
  file: File | Blob, 
  currentContentType: string, 
  currentExt: string
): Promise<{ body: File | Blob; contentType: string; extension: string }> {
  // Only compress if it is a browser environment, it's an image, and it's larger than 1.5MB
  if (typeof window === "undefined" || !currentContentType.startsWith("image/") || file.size < 1500000) {
    return { body: file, contentType: currentContentType, extension: currentExt };
  }
  
  // Skip GIFs, SVGs, and vector-related images to preserve animations/vectors
  if (
    currentContentType.includes("gif") || 
    currentContentType.includes("svg") || 
    currentContentType.includes("xml")
  ) {
    return { body: file, contentType: currentContentType, extension: currentExt };
  }

  try {
    console.log(`Compressing image of size ${(file.size / 1024 / 1024).toFixed(2)}MB to optimize and fit Supabase Storage limit...`);
    
    // Create an Image object
    const image = new Image();
    const url = URL.createObjectURL(file);
    
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = (err) => reject(err);
      image.src = url;
    });
    
    URL.revokeObjectURL(url);

    // Calculate new dimensions (max width/height of 1600px for crisp quality and small size)
    const MAX_WIDTH = 1600;
    const MAX_HEIGHT = 1600;
    let width = image.width;
    let height = image.height;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      if (width > height) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      } else {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return { body: file, contentType: currentContentType, extension: currentExt };

    ctx.drawImage(image, 0, 0, width, height);

    // Compress to highly efficient JPEG format at 82% quality
    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.82);
    });

    if (compressedBlob && compressedBlob.size < file.size) {
      console.log(`Successfully compressed image to ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
      return { 
        body: compressedBlob, 
        contentType: "image/jpeg", 
        extension: "jpg" 
      };
    }
  } catch (compressErr) {
    console.warn("Failed to compress image client-side, uploading original:", compressErr);
  }
  
  return { body: file, contentType: currentContentType, extension: currentExt };
}

/**
 * Helper to upload an image (either a File object or a base64 DataURL) to Supabase Storage
 * into the 'images' bucket. If successful, it returns the public URL of the uploaded image.
 * Otherwise, it returns the original input or falls back gracefully.
 */
export async function uploadImageToStorage(fileOrBase64: File | string, customFileName?: string): Promise<string> {
  if (!fileOrBase64) return "";

  // If Supabase is not configured, we cannot use Storage, so return the input as fallback
  if (!isSupabaseConfigured) {
    console.warn("Supabase is not configured. Falling back to inline base64/URL.");
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : "";
  }

  try {
    let fileBody: any;
    let fileExtension = "png";
    let contentType = "image/png";

    if (fileOrBase64 instanceof File) {
      fileBody = fileOrBase64;
      const parts = fileOrBase64.name.split(".");
      if (parts.length > 1) {
        fileExtension = parts.pop() || "png";
      }
      contentType = fileOrBase64.type;
    } else if (typeof fileOrBase64 === 'string') {
      // It's a string. If it's already a regular HTTP URL, just return it.
      if (fileOrBase64.startsWith("http://") || fileOrBase64.startsWith("https://")) {
        return fileOrBase64;
      }

      // If it's a data URL, decode it to a Blob of bytes
      if (fileOrBase64.startsWith("data:")) {
        const mimeMatch = fileOrBase64.match(/data:([^;]+);base64,/);
        if (mimeMatch) {
          contentType = mimeMatch[1];
          fileExtension = contentType.split("/")[1] || "png";
        }
        const response = await fetch(fileOrBase64);
        fileBody = await response.blob();
      } else {
        // Just return as-is
        return fileOrBase64;
      }
    } else {
      return "";
    }

    // Client-side optimize/compress if it's a large image
    const compressed = await compressImageIfNeeded(fileBody, contentType, fileExtension);
    fileBody = compressed.body;
    contentType = compressed.contentType;
    fileExtension = compressed.extension;

    // Generate a unique filename
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const fileName = customFileName 
      ? `${customFileName}-${uniqueId}.${fileExtension}`
      : `upload-${uniqueId}-${Date.now()}.${fileExtension}`;

    // Upload path
    const filePath = `images/${fileName}`;

    // Upload to 'images' bucket
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, fileBody, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType
      });

    if (error) {
      console.warn("Supabase Storage upload failed, attempting fallback to inline base64...", error.message);
      
      const isSizeError = error.message.toLowerCase().includes("size") || 
                          error.message.toLowerCase().includes("exceed") || 
                          error.message.toLowerCase().includes("limit") ||
                          error.message.toLowerCase().includes("too large");

      if (isSizeError) {
        console.warn(
          "⚠️ MAXIMUM FILE SIZE LIMIT EXCEEDED!\n" +
          "--------------------------------------------------\n" +
          "To fix this permanently for large uploads (like PDFs or custom fonts):\n" +
          "1. Go to your Supabase Dashboard (https://supabase.com/dashboard)\n" +
          "2. Navigate to Storage -> select your 'images' bucket (or create it if it doesn't exist)\n" +
          "3. Click 'Bucket Settings' (or Edit Bucket) in the top-right\n" +
          "4. Increase the 'Maximum file size' limit to 50MB, 100MB, or 500MB (524288000 bytes)\n" +
          "5. Click Save.\n" +
          "--------------------------------------------------\n" +
          "Note: Client-side anon keys are not allowed to change bucket settings via API for security reasons. " +
          "This setting must be changed manually once in the Supabase Dashboard."
        );
      }

      // If it is due to bucket missing, try creating it once just in case we have permission
      if (error.message.includes("not found") || error.message.includes("bucket")) {
        try {
          await supabase.storage.createBucket('images', {
            public: true,
            fileSizeLimit: 524288000 // 500MB
          });
          // Retry upload
          const retry = await supabase.storage.from('images').upload(filePath, fileBody, {
            cacheControl: '3600',
            upsert: true,
            contentType: contentType
          });
          if (!retry.error) {
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              return publicUrlData.publicUrl;
            }
          }
        } catch (bucketErr) {
          console.warn("Automatic bucket creation also failed:", bucketErr);
        }
      } else if (isSizeError) {
        // If it is a size limit error, try updating the existing bucket's size limit to 500MB
        try {
          console.log("Size limit exceeded. Attempting to update bucket size limit to 500MB...");
          await supabase.storage.updateBucket('images', {
            public: true,
            fileSizeLimit: 524288000 // 500MB
          });
          // Retry upload
          const retry = await supabase.storage.from('images').upload(filePath, fileBody, {
            cacheControl: '3600',
            upsert: true,
            contentType: contentType
          });
          if (!retry.error) {
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              return publicUrlData.publicUrl;
            }
          } else {
            console.warn("Retry after updating bucket size limit also failed:", retry.error.message);
          }
        } catch (bucketErr: any) {
          console.warn("Automatic bucket update failed:", bucketErr?.message);
        }
      }

      // Final bulletproof fallback: Convert file/blob to Base64 in-memory and return it
      if (fileBody instanceof File || fileBody instanceof Blob) {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : "");
          reader.readAsDataURL(fileBody);
        });
      }
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : "";
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      console.log("Successfully uploaded to Supabase Storage:", publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    }

    // If no public URL is returned, convert to base64 fallback
    if (fileBody instanceof File || fileBody instanceof Blob) {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : "");
        reader.readAsDataURL(fileBody);
      });
    }

    return typeof fileOrBase64 === 'string' ? fileOrBase64 : "";
  } catch (err: any) {
    console.error("Supabase Storage Upload failed, resolving with inline base64 fallback:", err.message);
    if (fileOrBase64 instanceof File) {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileOrBase64);
      });
    }
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : "";
  }
}

