/**
 * Email signup for the weekly issue. The list lives with a mailing provider, never in this repository:
 * set NEXT_PUBLIC_SIGNUP_ACTION to the provider's form endpoint and the form appears everywhere this
 * component is placed. Known endpoints:
 *   Buttondown  https://buttondown.com/api/emails/embed-subscribe/<username>
 *   Listmonk    https://<host>/subscription/form   (add hidden list uuid inputs via NEXT_PUBLIC_SIGNUP_LIST)
 * The form posts the address and nothing else: no scripts, no pixels, no third-party assets on the page.
 * Until the endpoint is set, the box offers the Atom feed and the per-page Watch button instead.
 */
const ACTION = process.env.NEXT_PUBLIC_SIGNUP_ACTION ?? "";
const LIST = process.env.NEXT_PUBLIC_SIGNUP_LIST ?? "";

export function SignupBox({ compact = false }: { compact?: boolean }) {
  if (!ACTION) {
    return (
      <div className={compact ? "text-sm" : "card p-4 text-sm"}>
        <div className="font-medium">Stay connected</div>
        <p className="text-muted mt-1">Follow the <a className="underline" href="/newsletter/feed.xml">weekly issue by feed</a>, or press Watch on any page to keep it on your list.</p>
      </div>
    );
  }
  return (
    <form action={ACTION} method="post" target="_blank" className={compact ? "text-sm" : "card p-4 text-sm"}>
      <label htmlFor="signup-email" className="font-medium block">Stay connected</label>
      <p className="text-muted mt-1 mb-2">One email a week with what changed in the corpus, regulatory events and upcoming readouts. Unsubscribe in one click; your address goes to the list provider and nowhere else.</p>
      <div className="flex flex-wrap gap-2 items-center">
        <input id="signup-email" name="email" type="email" required autoComplete="email" placeholder="you@example.org" className="rounded-lg border border-border bg-background px-3 py-2 text-sm min-w-[14rem] flex-1" />
        {LIST && <input type="hidden" name="l" value={LIST} />}
        <input type="hidden" name="tag" value="onco.cc" />
        <button type="submit" className="btn btn-primary text-sm">Keep me posted</button>
      </div>
    </form>
  );
}
