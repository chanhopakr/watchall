Ext.define('apps.store.arbor.FingerPrint', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.fingerprint',

  requires: ['Ext.data.reader.Array'],

  autoLoad: true,

  fields: ['id', 'name', 'description'],

  proxy: {
    type: 'memory',

    reader: {
      type: 'array'
    },

    data: [
      [
        '1',
        'Botnet Command & Control (C&C) Server Traffic Identification',
        'Botnets are a collection of compromised hosts that attackers can remotely control to launch nefarious attacks, such as denial of service (DoS).'
      ],
      [
        '2',
        'Instant Messaging (IM) Traffic Identification',
        'Instant messaging (IM) clients allows users to transmit messages consisting of text, voice, and video.'
      ],
      [
        '3',
        'Internet Relay Chat (IRC) Traffic Identification',
        'Internet Relay Chat (IRC) networks allows for real-time text communication with individuals throughout the world.'
      ],
      [
        '4',
        'Malicious Code',
        'Malicious code is used to build websites that deliver one of a set of reliable client exploits. Clients visit these sites by being fed to compromised websites through other modified sites.'
      ],
      [
        '15',
        'Off-site Backup Services',
        'Off-site backup services are commercial sites that provide managed file storage and system backups as a service, typically in the cloud, with variable degrees of security, encryption and protection.'
      ],
      ['13', 'Other', 'Threats that do not fall in the other categories.'],
      [
        '5',
        'Peer-to-Peer (P2P) Traffic Identification',
        '(P2P) file-sharing protocol is used for rapidly transferring files of any type (often music, movies, or other media) between many different hosts simultaneously.'
      ],
      [
        '6',
        'Phishing Traffic Identification',
        'Phishing hosting servers host content that is designed to socially engineer unsuspecting users into surrendering private information that will be used for identity theft.'
      ],
      ['7', 'Remote Access Application(s)', 'Remote Access Applications.'],
      [
        '8',
        'Scanning Activity',
        'Traffic from attackers actively looking for vulnerable systems.'
      ],
      [
        '14',
        'Social Networking Sites',
        'Social networking sites are websites and platforms that enable users from around the world to discuss common interests, share media files, and communicate freely.'
      ],
      [
        '9',
        'US Embargoed Nation(s) Traffic Identification',
        'Traffic to countries subject to export restrictions imposed by the US government.'
      ],
      [
        '16',
        'Video Sites',
        'Internet video sites are websites that provide videos produced by users or third-parties, typically delivered over the web.'
      ],
      ['10', 'Voice over IP (VoIP) Traffic Identification', 'VoIP Traffic.'],
      [
        '11',
        'Vulnerability/Exploit Scanning',
        'Scanning for remote exploitation of vulnerabilities to gain administrative access to systems.'
      ],
      [
        '12',
        'Webmail Traffic Identification',
        'Webmail is a collection of generally free web-based e-mail service that allows users to send e-mail from their personal accounts via an interface accessible through a Web site.'
      ]
    ]
  }
});
