// functions/_middleware.js
export async function onRequest(context) {
  // 1. Get the page the user is asking for (Homepage, Reading, etc.)
  const response = await context.next();
  
  // 2. Check if it is an HTML page
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("text/html")) {
    // 3. Inject AI2.js into the <head> of the page automatically
    return new HTMLRewriter()
      .on("head", {
        append: (element) => {
          element.append('<script src="/AI2.js"></script>', { html: true });
        },
      })
      .transform(response);
  }
  
  // 4. If it's an image or CSS, just let it pass
  return response;
}
