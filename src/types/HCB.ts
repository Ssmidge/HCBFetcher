export type Organization = {
  id: "string";
  object: "string";
  href: "string";
  name: "string";
  slug: "string";
  website: "string";
  category: "hackathon";
  transparent: true;
  demo_mode: true;
  logo: "string";
  donation_header: "string";
  background_image: "string";
  public_message: "string";
  donation_link: "string";
  balances: {
    balance_cents: 0;
    fee_balance_cents: 0;
    incoming_balance_cents: 0;
    total_raised: 0;
  },
  created_at: "string";
  users: [
    {
      id: "string";
      object: "string";
      full_name: "string";
      admin: true;
      photo: "string";
    }
  ];
};

export type Transaction = {
    id: "string";
    object: "string";
    href: "string";
    amount_cents: 0;
    memo: "string";
    date: "string";
    type: "invoice";
    pending: true;
    receipts: {
        count: 0;
        missing: true;
    },
    comments: {
        count: 0;
    },
    organization: {
        id: "string";
        object: "string";
        href: "string";
        name: "string";
        slug: "string";
        website: "string";
        category: "hackathon";
        transparent: true;
        demo_mode: true;
        logo: "string";
        donation_header: "string";
        background_image: "string";
        public_message: "string";
        donation_link: "string";
        balances: {
            balance_cents: 0;
            fee_balance_cents: 0;
            incoming_balance_cents: 0;
            total_raised: 0;
        },
        created_at: "string";
        users: [{}];
    },
    tags: [
        {
            id: "string";
            object: "string";
            label: "string";
        }
    ],
    card_charge: {
        id: "string";
        object: "string";
        href: "string";
        memo: "string";
        transaction: {},
        organization: {
            id: "string";
            object: "string";
            href: "string";
            name: "string";
            slug: "string";
            website: "string";
            category: "hackathon";
            transparent: true;
            demo_mode: true;
            logo: "string";
            donation_header: "string";
            background_image: "string";
            public_message: "string";
            donation_link: "string";
            balances: {},
            created_at: "string";
            users: [{}];
        },
        amount_cents: 0;
        date: "string";
        card: {
            id: "string";
            object: "string";
            href: "string";
            name: "string";
            type: "virtual";
            status: "active";
            issued_at: "string";
            owner: {},
            organization: {
            balances: {},
            users: [];
            },
        },
        user: {
            id: "string";
            object: "string";
            full_name: "string";
            admin: true;
            photo: "string";
        },
    },
    ach_transfer: {
        id: "string";
        object: "string";
        href: "string";
        memo: "string";
        transaction: {},
        organization: {
            id: "string";
            object: "string";
            href: "string";
            name: "string";
            slug: "string";
            website: "string";
            category: "hackathon";
            transparent: true;
            demo_mode: true;
            logo: "string";
            donation_header: "string";
            background_image: "string";
            public_message: "string";
            donation_link: "string";
            balances: {},
            created_at: "string";
            users: [{}];
        },
        amount_cents: "string";
        date: "string";
        status: "pending";
        beneficiary: {
            name: "string";
        },
    },
    check: {
        id: "string";
        object: "string";
        href: "string";
        memo: "string";
        transaction: {},
        organization: {
            id: "string";
            object: "string";
            href: "string";
            name: "string";
            slug: "string";
            website: "string";
            category: "hackathon";
            transparent: true;
            demo_mode: true;
            logo: "string";
            donation_header: "string";
            background_image: "string";
            public_message: "string";
            donation_link: "string";
            balances: {},
            created_at: "string";
            users: [{}];
        },
        amount_cents: 0;
        date: "string";
        status: "scheduled";
    },
    donation: {
        id: "string";
        object: "string";
        href: "string";
        memo: "string";
        transaction: {},
        organization: {
            id: "string";
            object: "string";
            href: "string";
            name: "string";
            slug: "string";
            website: "string";
            category: "hackathon";
            transparent: true;
            demo_mode: true;
            logo: "string";
            donation_header: "string";
            background_image: "string";
            public_message: "string";
            donation_link: "string";
            balances: {},
            created_at: "string";
            users: [{}];
        },
        amount_cents: 0;
        donor: {
            name: "string";
            anonymous: true;
        },
        date: "string";
        status: "pending";
        recurring: true;
    },
    invoice: {
        id: "string";
        object: "string";
        href: "string";
        memo: "string";
        transaction: {},
        organization: {
            id: "string";
            object: "string";
            href: "string";
            name: "string";
            slug: "string";
            website: "string";
            category: "hackathon";
            transparent: true;
            demo_mode: true;
            logo: "string";
            donation_header: "string";
            background_image: "string";
            public_message: "string";
            donation_link: "string";
            balances: {},
            created_at: "string";
            users: [{}];
        },
        amount_cents: "string";
        sponsor: {
            id: "string";
            name: "string";
        },
        date: "string";
        status: "open";
    },
    transfer: {
        id: "string";
        object: "string";
        href: "string";
        memo: "string";
        transaction: {},
        organization: {
            id: "string";
            object: "string";
            href: "string";
            name: "string";
            slug: "string";
            website: "string";
            category: "hackathon";
            transparent: true;
            demo_mode: true;
            logo: "string";
            donation_header: "string";
            background_image: "string";
            public_message: "string";
            donation_link: "string";
            balances: {},
            created_at: "string";
            users: [{}];
        },
        amount_cents: "string";
        date: "string";
        status: "fulfilled";
    },
};