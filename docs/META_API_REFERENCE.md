# Meta Marketing API v21.0 — Parameter Reference

> This document is the agent's source of truth for creating campaigns, ad sets, creatives, and ads via the Meta Marketing API. Always consult this before calling any create tool.

## 1. Campaign Objectives (ODAX — v21.0+)

Meta v21+ uses **Outcome-Driven Ad Experiences (ODAX)** objectives only. Legacy objectives are deprecated.

| Objective | Purpose | When to Use |
|---|---|---|
| `OUTCOME_AWARENESS` | Maximize reach and brand recall | Brand awareness, reach campaigns |
| `OUTCOME_TRAFFIC` | Drive people to a destination (website, app, Messenger) | Website visits, landing page views |
| `OUTCOME_ENGAGEMENT` | Get more interactions (likes, comments, shares, video views, event responses) | Post engagement, video views, page likes |
| `OUTCOME_LEADS` | Collect leads via forms, Messenger, or calls | Lead generation, instant forms, WhatsApp leads |
| `OUTCOME_APP_PROMOTION` | Drive app installs and in-app events | App installs, app engagement |
| `OUTCOME_SALES` | Drive purchases, add-to-carts, or other conversion events | E-commerce, website conversions, catalog sales |

## 2. Objective → Optimization Goal → Billing Event Matrix

### OUTCOME_AWARENESS
| Optimization Goal | Billing Event | Notes |
|---|---|---|
| `REACH` | `IMPRESSIONS` | Maximize unique people reached |
| `IMPRESSIONS` | `IMPRESSIONS` | Maximize total impressions |
| `AD_RECALL_LIFT` | `IMPRESSIONS` | Optimize for estimated ad recall lift |
| `THRUPLAY` | `IMPRESSIONS` | Video views (15+ seconds or complete) |

### OUTCOME_TRAFFIC
| Optimization Goal | Billing Event | Notes |
|---|---|---|
| `LINK_CLICKS` | `IMPRESSIONS` | Default. Optimize for clicks to destination |
| `LINK_CLICKS` | `LINK_CLICKS` | Pay per click. **Requires bid_amount (bid cap)** |
| `LANDING_PAGE_VIEWS` | `IMPRESSIONS` | Optimize for full page loads (needs pixel) |
| `REACH` | `IMPRESSIONS` | Maximize unique reach with traffic objective |
| `IMPRESSIONS` | `IMPRESSIONS` | Maximize impressions |

### OUTCOME_ENGAGEMENT
| Optimization Goal | Billing Event | Notes |
|---|---|---|
| `POST_ENGAGEMENT` | `IMPRESSIONS` | Likes, comments, shares |
| `THRUPLAY` | `IMPRESSIONS` | Video views (15s+ or complete) |
| `TWO_SECOND_CONTINUOUS_VIDEO_VIEWS` | `IMPRESSIONS` | 2+ second video views |
| `PAGE_LIKES` | `IMPRESSIONS` | Facebook Page likes |
| `EVENT_RESPONSES` | `IMPRESSIONS` | Event RSVPs |
| `CONVERSATIONS` | `IMPRESSIONS` | Messenger/WhatsApp/IG conversations |

### OUTCOME_LEADS
| Optimization Goal | Billing Event | Notes |
|---|---|---|
| `LEAD_GENERATION` | `IMPRESSIONS` | Instant Form leads. **Most common for leads** |
| `LINK_CLICKS` | `IMPRESSIONS` | Click to lead form/website |
| `CONVERSATIONS` | `IMPRESSIONS` | WhatsApp/Messenger lead conversations |
| `QUALITY_LEAD` | `IMPRESSIONS` | Higher quality leads (needs CRM integration or conversion API) |

### OUTCOME_APP_PROMOTION
| Optimization Goal | Billing Event | Notes |
|---|---|---|
| `APP_INSTALLS` | `IMPRESSIONS` | Maximize app installs |
| `LINK_CLICKS` | `IMPRESSIONS` | Clicks to app store |
| `OFFSITE_CONVERSIONS` | `IMPRESSIONS` | In-app events (purchase, registration) |

### OUTCOME_SALES
| Optimization Goal | Billing Event | Notes |
|---|---|---|
| `OFFSITE_CONVERSIONS` | `IMPRESSIONS` | **Most common for purchases.** Needs pixel + conversion event |
| `VALUE` | `IMPRESSIONS` | Optimize for highest purchase value (ROAS). Needs value tracking |
| `LINK_CLICKS` | `IMPRESSIONS` | Clicks to product pages |
| `CONVERSATIONS` | `IMPRESSIONS` | Sales via WhatsApp/Messenger |
| `LANDING_PAGE_VIEWS` | `IMPRESSIONS` | Full page loads on product pages |

## 3. Billing Event Rules

| Billing Event | When It's Used | Constraint |
|---|---|---|
| `IMPRESSIONS` | **Default for almost everything.** Meta charges per 1,000 impressions (CPM). | No bid cap required |
| `LINK_CLICKS` | Only with `LINK_CLICKS` optimization goal. Pay per actual click (CPC). | **Requires `bid_amount` field** (bid cap in cents). Without it, API returns error 2490487. |
| `THRUPLAY` | Legacy — for video view campaigns. Largely replaced by IMPRESSIONS billing. | Check if still supported for your account |
| `APP_INSTALLS` | Legacy — for app install campaigns. Largely replaced by IMPRESSIONS billing. | Check if still supported for your account |

**Safe default:** Use `IMPRESSIONS` as billing event unless the user explicitly wants to pay per click (CPC model), in which case use `LINK_CLICKS` + provide a `bid_amount`.

## 4. Required Fields by Entity

### Campaign (`POST /{ad_account_id}/campaigns`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Campaign name |
| `objective` | enum | Yes | One of the OUTCOME_* values |
| `status` | enum | Yes | `PAUSED` or `ACTIVE` |
| `special_ad_categories` | array | Yes | `[]` for none, or `["EMPLOYMENT"]`, `["HOUSING"]`, `["CREDIT"]`, `["ISSUES_ELECTIONS_POLITICS"]` |
| `is_adset_budget_sharing_enabled` | boolean | Conditional | **Required when NOT using campaign budget (ABO).** Set `false` for standard ABO. |
| `daily_budget` | integer | Conditional | Campaign daily budget in cents. Only for CBO. Omit for ABO. |
| `lifetime_budget` | integer | Conditional | Campaign lifetime budget in cents. Only for CBO. Omit for ABO. |
| `buying_type` | string | No | Default `"AUCTION"`. Alternative: `"RESERVED"` for reach & frequency |
| `bid_strategy` | enum | No | `LOWEST_COST_WITHOUT_CAP` (default), `LOWEST_COST_WITH_BID_CAP`, `COST_CAP` |

### Ad Set (`POST /{ad_account_id}/adsets`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `campaign_id` | string | Yes | Parent campaign ID |
| `name` | string | Yes | Ad set name |
| `optimization_goal` | enum | Yes | See matrix above |
| `billing_event` | enum | Yes | See matrix above |
| `daily_budget` | integer | Conditional | Daily budget in cents. Required if campaign is ABO. |
| `lifetime_budget` | integer | Conditional | Alternative to daily_budget |
| `targeting` | object | Yes | See targeting spec below |
| `status` | enum | Yes | `PAUSED` or `ACTIVE` |
| `start_time` | ISO 8601 | Yes | Must be in the future |
| `end_time` | ISO 8601 | Conditional | Required if using lifetime_budget |
| `bid_amount` | integer | Conditional | **Required if billing_event is `LINK_CLICKS`**. Bid cap in cents. |
| `promoted_object` | object | Conditional | Required for OFFSITE_CONVERSIONS, LEAD_GENERATION, APP_INSTALLS. See below. |

#### Promoted Object (required for certain optimization goals)
| Optimization Goal | promoted_object | Example |
|---|---|---|
| `OFFSITE_CONVERSIONS` | `{ "pixel_id": "...", "custom_event_type": "PURCHASE" }` | Needs Meta Pixel |
| `LEAD_GENERATION` | `{ "page_id": "..." }` | Facebook Page for lead form |
| `APP_INSTALLS` | `{ "application_id": "...", "object_store_url": "..." }` | App Store URL |
| `CONVERSATIONS` | `{ "page_id": "..." }` | Facebook Page for messaging |
| `VALUE` | `{ "pixel_id": "...", "custom_event_type": "PURCHASE" }` | Needs value tracking |

#### Targeting Spec Structure
```json
{
  "age_min": 18,
  "age_max": 65,
  "genders": [1, 2],
  "geo_locations": {
    "countries": ["US", "GB"],
    "cities": [{ "key": "2421836", "radius": 10, "distance_unit": "mile" }]
  },
  "flexible_spec": [
    {
      "interests": [
        { "id": "6003139266461", "name": "Social media" }
      ]
    }
  ],
  "exclusions": {
    "interests": [{ "id": "...", "name": "..." }]
  },
  "custom_audiences": [{ "id": "..." }],
  "excluded_custom_audiences": [{ "id": "..." }]
}
```

- `genders`: 1 = male, 2 = female. Omit for all.
- `age_min`: minimum 18
- `age_max`: maximum 65
- Interest IDs **must** come from `/search?type=adinterest&q=...` — never guess them.

### Ad Creative (`POST /{ad_account_id}/adcreatives`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Creative name |
| `object_story_spec` | object | Yes | Contains page_id + link_data or video_data |

#### object_story_spec for link ads (image + link)
```json
{
  "page_id": "YOUR_PAGE_ID",
  "link_data": {
    "image_url": "https://...",
    "message": "Primary text (the main ad copy)",
    "name": "Headline text",
    "description": "Description under headline",
    "link": "https://destination-url.com",
    "call_to_action": {
      "type": "SHOP_NOW",
      "value": { "link": "https://destination-url.com" }
    }
  }
}
```

#### Call-to-Action Types
| CTA | Best For |
|---|---|
| `SHOP_NOW` | E-commerce, product sales |
| `LEARN_MORE` | General purpose, informational |
| `SIGN_UP` | Registration, newsletters |
| `BOOK_NOW` | Appointments, reservations |
| `CONTACT_US` | Service businesses |
| `GET_OFFER` | Promotions, discounts |
| `SUBSCRIBE` | Subscriptions, SaaS |
| `DOWNLOAD` | App downloads, digital products |
| `GET_QUOTE` | Insurance, services |
| `APPLY_NOW` | Jobs, applications |
| `ORDER_NOW` | Food delivery, urgent purchases |
| `WHATSAPP_MESSAGE` | WhatsApp-based sales |
| `SEND_MESSAGE` | Messenger conversations |

### Ad (`POST /{ad_account_id}/ads`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Ad name |
| `adset_id` | string | Yes | Parent ad set ID |
| `creative` | object | Yes | `{ "creative_id": "..." }` |
| `status` | enum | Yes | `PAUSED` or `ACTIVE` |

## 5. Special Ad Categories

Required on every campaign. Pass empty array `[]` if none apply.

| Category | When Required |
|---|---|
| `EMPLOYMENT` | Job ads |
| `HOUSING` | Real estate, rentals |
| `CREDIT` | Loans, credit cards, insurance |
| `ISSUES_ELECTIONS_POLITICS` | Political ads |

When a special category is set, targeting restrictions apply (no age, gender, zip code targeting).

## 6. Common Error Codes

| Error Code | Subcode | Meaning | Fix |
|---|---|---|---|
| 100 | 4834011 | Missing `is_adset_budget_sharing_enabled` | Add `is_adset_budget_sharing_enabled: false` for ABO campaigns |
| 100 | 2490487 | Bid amount required for `LINK_CLICKS` billing | Either switch billing_event to `IMPRESSIONS`, or provide `bid_amount` |
| 100 | 1487079 | Invalid interest ID in targeting | Use `searchInterests` tool to get valid IDs |
| 100 | — | Invalid parameter (general) | Check field names and values against this reference |
| 190 | — | Access token expired | Reconnect Meta account |
| 10 | — | Rate limit exceeded | Wait and retry |
| 17 | — | API call rate limit | Reduce call frequency |

## 7. Decision Flow for the Agent

When creating a campaign, follow this decision tree:

```
1. What does the user want?
   ├── Brand awareness / reach → OUTCOME_AWARENESS
   ├── Website traffic → OUTCOME_TRAFFIC
   ├── Engagement / video views → OUTCOME_ENGAGEMENT
   ├── Leads / sign-ups → OUTCOME_LEADS
   ├── App installs → OUTCOME_APP_PROMOTION
   └── Sales / purchases / conversions → OUTCOME_SALES

2. Pick optimization goal from the matrix above

3. Billing event:
   └── Almost always IMPRESSIONS
       Exception: LINK_CLICKS billing only if user explicitly wants CPC
       (requires bid_amount — ask user for their max bid per click)

4. Does optimization goal need promoted_object?
   ├── LEAD_GENERATION → needs { page_id }
   ├── OFFSITE_CONVERSIONS → needs { pixel_id, custom_event_type }
   ├── VALUE → needs { pixel_id, custom_event_type }
   ├── APP_INSTALLS → needs { application_id, object_store_url }
   └── Others → no promoted_object needed

5. If anything is ambiguous, ASK the user with suggested replies
```
