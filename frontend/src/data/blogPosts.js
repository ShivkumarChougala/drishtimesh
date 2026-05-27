export const blogPosts = [
  {
    slug: "why-static-blocklists-miss-modern-attackers",
    title: "Why Static Blocklists Miss Modern Attackers",
    category: "Insights",
    readTime: "5 min read",
    date: "May 27, 2026",
    author: "DrishtiMesh Team",
    featured: true,
    excerpt:
      "Static IP blocklists are useful, but modern attackers rotate infrastructure faster than traditional feeds can react.",
    coverLabel: "IP Reputation",
    tags: ["Blocklists", "Threat Intel", "Reputation"],
    sections: [
      {
        heading: "The problem with static blocklists",
        body:
          "Traditional blocklists often depend on delayed reports, manual review, or third-party aggregation. That means fresh attacker infrastructure can stay active before it appears in public feeds."
      },
      {
        heading: "Attackers move faster now",
        body:
          "Cloud VPS abuse, proxy rotation, and short-lived infrastructure make IP reputation harder. An IP can be clean yesterday, abusive today, and abandoned tomorrow."
      },
      {
        heading: "How DrishtiMesh helps",
        body:
          "DrishtiMesh collects live telemetry from deployed sensors, turns attack activity into signals, and explains why an IP looks suspicious or malicious."
      }
    ]
  },
  {
    slug: "stealc-malware-targeting-browser-sessions",
    title: "StealC Malware Campaign Targets Browser Sessions and Crypto Wallets",
    category: "Threat Signals",
    readTime: "7 min read",
    date: "May 27, 2026",
    author: "DrishtiMesh Research",
    featured: false,
    excerpt:
      "A new StealC malware campaign is aggressively targeting browser sessions, saved credentials, and cryptocurrency wallets using fake software installers and phishing infrastructure.",
    coverLabel: "Malware Activity",
    tags: ["Malware", "Infostealer", "Threat Intel", "Phishing"],
    sections: [
      {
        heading: "What happened",
        body:
          "Security researchers observed a fresh StealC malware distribution campaign using fake browser updates, cracked software installers, and phishing landing pages."
      },
      {
        heading: "Why this matters",
        body:
          "Session theft can bypass MFA by reusing authenticated browser sessions against cloud services, email platforms, and crypto accounts."
      },
      {
        heading: "DrishtiMesh perspective",
        body:
          "Fast-moving campaigns need behavior signals, infrastructure reputation, and real-time telemetry instead of only static IP feeds."
      }
    ]
  },
  {
    slug: "honeypot-ssh-activity-spike",
    title: "SSH Honeypot Sensors Detect Large-Scale Reconnaissance Activity",
    category: "Research",
    readTime: "6 min read",
    date: "May 26, 2026",
    author: "DrishtiMesh Labs",
    featured: false,
    excerpt:
      "Distributed SSH honeypot sensors observed coordinated reconnaissance activity targeting exposed VPS infrastructure.",
    coverLabel: "SSH Recon",
    tags: ["SSH", "Recon", "Honeypot", "Telemetry"],
    sections: [
      {
        heading: "Reconnaissance activity increased",
        body:
          "DrishtiMesh sensors recorded automated reconnaissance traffic targeting SSH services across multiple regions."
      },
      {
        heading: "Common commands observed",
        body:
          "Commands like uname, whoami, hostname, history, and network inspection tools help attackers understand the target environment."
      },
      {
        heading: "Why telemetry matters",
        body:
          "Continuous telemetry helps defenders detect behavior patterns even when attacker infrastructure changes quickly."
      }
    ]
  },
  {
    slug: "community-sensors-improve-ip-reputation",
    title: "How Community Sensors Improve Modern IP Reputation Intelligence",
    category: "Insights",
    readTime: "5 min read",
    date: "May 25, 2026",
    author: "DrishtiMesh Team",
    featured: false,
    excerpt:
      "Distributed community sensors provide earlier visibility into malicious infrastructure before traditional reputation feeds update.",
    coverLabel: "Community Intelligence",
    tags: ["IP Reputation", "Community", "Threat Intel"],
    sections: [
      {
        heading: "Traditional reputation has delays",
        body:
          "Most reputation systems rely on delayed reports, abuse complaints, or external submissions."
      },
      {
        heading: "Distributed sensors change visibility",
        body:
          "Community-operated sensors observe malicious behavior directly from live traffic."
      },
      {
        heading: "The future of reputation intelligence",
        body:
          "Modern threat intelligence depends on distributed telemetry and continuously updated behavioral analysis."
      }
    ]
  }
];

export function getPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(currentSlug, limit = 3) {
  return blogPosts.filter((post) => post.slug !== currentSlug).slice(0, limit);
}
