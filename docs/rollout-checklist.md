# Rollout and QA Checklist

## Functional QA
- [x] Guest browse and search - Done
- [x] Login and logout - Login with email id is left
- [x] Add/remove cart items - Done
- [x] Invalid pincode handling - Done
- [ ] Valid and full delivery slot handling -- Later
- [ ] Successful payment and failed payment -- Later
- [ ] **[Checkout Phone Flow]** User with registered phone sees "Use registered number" pre-selected
- [ ] **[Checkout Phone Flow]** User can pick a previously saved alternate number
- [ ] **[Checkout Phone Flow]** User can enter a new number; it is saved to `customer_additional_phones`
- [ ] **[Checkout Phone Flow]** New user (no phone on profile) is asked to enter phone at checkout
- [ ] Order confirmation and webhook reconciliation
- [ ] Subscription pause/resume -- 
- [ ] Admin inventory edits
- [ ] Promotion eligibility and rejection cases
- [ ] Recommendation widget renders and logs events

## Security QA
- [ ] Anon user cannot read private order data
- [ ] Customer cannot read other customer data
- [ ] Admin routes blocked for non-admins
- [ ] Storage buckets enforce correct permissions
- [ ] Service-role key not present in client bundle

## Performance QA
- [ ] Product list queries under expected load
- [ ] Checkout validation latency
- [ ] Admin order board latency
- [ ] Vector recommendation latency after embeddings launch

## Rollout plan
1. Staging environment deployed
2. Internal test with seeded data
3. Limited real-customer beta
4. Monitored production launch
5. Enable recommendation features gradually
