# Launch test: two accounts

Run this on http://localhost:8080 (or the live site once the new code is online).
It uses the real database, so everything you create here is real until you clean it up
with `supabase/live/02_cleanup_test_data.sql`.

**You need:** your admin account, plus two new test accounts with emails you can recognise later,
for example `yourname+seller@gmail.com` and `yourname+buyer@gmail.com` (Gmail delivers both to you).
Use a second browser or a private window for the buyer, so both can be signed in at once.

Before you start: in **Admin → Platform features**, switch MID, Open Inventory, WaveChat and
Conscience to **Motorcars**. Leave Argus as it is until it has an API key.

Write down anything that looks wrong, with the step number.

## A. Sign-up (both accounts)

- [ ] 1. Go to `/register` and create the **seller** account. It should let you in without an email error.
- [ ] 2. In the private window, create the **buyer** account the same way.
- [ ] 3. Each account: **Edit profile**, add a Nigerian phone number, save.
- [ ] 4. Each account: on **My listings**, press **Create my MID**. A 10-digit number appears, marked unverified, with points under "How you earned it".

## B. Seller lists a car

- [ ] 5. Seller: **List a car** (`/sell`), fill it in with 2–3 photos, submit. It shows as **In review** on My listings.
- [ ] 6. Admin: in `/admin`, approve the car.
- [ ] 7. Seller: the car is now **Live**. Press **Still available**: a green "confirmed" message appears.
- [ ] 8. Seller: **History** on the car shows "listed" and "availability confirmed".
- [ ] 9. Buyer: find the car on `/cars`. It shows as available and confirmed recently.

## C. Buyer and seller chat

- [ ] 10. Buyer: open the car and press **Chat with the seller**.
- [ ] 11. Seller: the message count appears at the top; open **Messages** and reply.
- [ ] 12. Both: send a photo, a voice note (allow the microphone), and reply to a message. Add a reaction.
- [ ] 13. Buyer: **Arrange inspection** and pick a time. Seller: accept it.
- [ ] 14. Buyer: **Make an offer**. Seller: counter or **Accept**.
- [ ] 15. Seller: **Record deposit**, then **Record final payment**. The buyer gets a receipt each time.
- [ ] 16. Buyer: **Confirm receipt** on the final receipt.
- [ ] 17. Seller: the car is now **Sold** on My listings, and the stand page no longer shows it for sale.
- [ ] 18. Both: go through the handover checklist in the chat until it shows **Handed over**.

## D. Reports and Conscience

- [ ] 19. Seller: list a second car, admin approves it.
- [ ] 20. Buyer: on that car, **Report this listing** → sold or unavailable, with a short note.
- [ ] 21. Admin: in **Reports**, the report is there. Try **Uphold** (it asks for a note).
- [ ] 22. Seller: **My listings** shows a **Conscience record** card with the current cycle.
- [ ] 23. Admin: **Platform features → Check all cycles now** runs without an error.

## E. Things that must be refused

- [ ] 24. Buyer: the seller's car has no edit button for you, and `/sell/edit/<the car's id>` doesn't let you change it.
- [ ] 25. Seller: in **Account settings**, turn off messages. The buyer can no longer start a new chat with them.
- [ ] 26. Signed out: `/messages` and `/my-listings` ask you to sign in.
- [ ] 27. Signed out: **Verified dealers** and a dealer's page still show (name, area, cars) but no ID or tax numbers.

## F. Phone check

- [ ] 28. Open the site on your phone (same Wi-Fi, address shown in the terminal as "Network"). Do steps 9–12 there.

## After the test

Send me the list of anything that went wrong. Then run `supabase/live/01_find_test_data.sql`,
put the two test emails into `02_cleanup_test_data.sql`, run it once as it is (it only counts),
and once more with `really_delete` set to `true`.
