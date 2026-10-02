<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep public catalog reads in a public server function and checkout writes in a server-only validated function, because product prices and orders must not be trusted from the browser.
- Keep administrator roles in a separate, read-protected table and authorize dashboard reads on the server, because a hidden link is not access control.
- Keep sample products in the database migration rather than seeding during page load, because the first storefront view needs deterministic catalog content.
