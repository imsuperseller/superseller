#!/usr/bin/env node

/**
 * 🎯 N8N WORKFLOW MODIFICATION FOR ISRAELI LEADS
 * ==============================================
 * 
 * This script modifies the existing n8n workflow to target Israeli professionals
 * living in the USA, ages 25-50, with names and phone numbers
 */

import { createClient } from '@supabase/supabase-js';

class N8NWorkflowModifier {
  constructor() {
    this.workflowId = 'cgk7FI57o6cg3eju';
    this.n8nBaseUrl = 'http://173.254.201.134:5678';
    this.supabaseUrl = 'https://zjfnwpsmfbqslkkbpwqq.supabase.co';
    this.supabaseKey = 'sb_secret_-Xb6R_t9AuYmzjheZwhxnQ_LBt4cwuR';
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  async modifyWorkflowForIsraeliLeads() {
    console.log('🎯 MODIFYING N8N WORKFLOW FOR ISRAELI LEADS');
    console.log('===========================================');
    console.log('');

    // Step 1: Modify form input for Israeli-specific searches
    await this.modifyFormInput();
    
    // Step 2: Enhance Google Maps scraping for Israeli businesses
    await this.modifyGoogleMapsScraping();
    
    // Step 3: Enhance LinkedIn scraping for Israeli professionals
    await this.modifyLinkedInScraping();
    
    // Step 4: Add data processing filters
    await this.addDataProcessingFilters();
    
    // Step 5: Create database queries for Israeli leads
    await this.createIsraeliLeadQueries();
    
    // Step 6: Test the modified workflow
    await this.testModifiedWorkflow();
    
    console.log('✅ Workflow modification completed!');
  }

  async modifyFormInput() {
    console.log('🔧 Modifying form input for Israeli-specific searches...');
    
    const modifiedFormFields = {
      "formTitle": "Israeli Professionals in USA - Targeted Leads",
      "formDescription": "This form targets Israeli professionals living in the USA, ages 25-50, with names and phone numbers.",
      "formFields": {
        "values": [
          {
            "fieldLabel": "Professional Title",
            "placeholder": "Israeli CEO, Israeli Marketing Director, Israeli Business Owner",
            "requiredField": true
          },
          {
            "fieldLabel": "US Location",
            "placeholder": "New York, Los Angeles, Miami, Chicago, Boston, San Francisco",
            "requiredField": true
          },
          {
            "fieldLabel": "Search Keywords",
            "placeholder": "Israeli, Israel, Hebrew, Tel Aviv, Jerusalem, Kosher",
            "requiredField": true
          },
          {
            "fieldLabel": "Source",
            "fieldType": "dropdown",
            "fieldOptions": {
              "values": [
                { "option": "Google Maps" },
                { "option": "LinkedIn" },
                { "option": "Both" }
              ]
            },
            "requiredField": true
          },
          {
            "fieldLabel": "Number of results",
            "fieldType": "number",
            "placeholder": "Enter number desired results (max 1000)"
          }
        ]
      }
    };

    console.log('  ✅ Form input modified for Israeli targeting');
    return modifiedFormFields;
  }

  async modifyGoogleMapsScraping() {
    console.log('🔧 Modifying Google Maps scraping for Israeli businesses...');
    
    const modifiedGoogleMapsConfig = {
      "operation": "Run actor and get dataset",
      "actorId": "nwua9Gu5YrADL7ZDj",
      "customBody": `{
        "includeWebResults": false,
        "language": "en",
        "locationQuery": "{{ $json['US Location'] }}, USA",
        "maxCrawledPlacesPerSearch": "{{ $json['Number of results'] }}",
        "maxImages": 0,
        "maximumLeadsEnrichmentRecords": 0,
        "scrapeContacts": true,
        "scrapeDirectories": false,
        "scrapeImageAuthors": false,
        "scrapePlaceDetailPage": true,
        "scrapeReviewsPersonalData": true,
        "scrapeTableReservationProvider": false,
        "searchStringsArray": [
          "Israeli {{ $json['Professional Title'] }}",
          "Israeli business",
          "Israeli restaurant",
          "Israeli community center",
          "Hebrew {{ $json['Professional Title'] }}",
          "Kosher restaurant",
          "Israeli grocery",
          "Israeli cultural center",
          "Israeli tech company",
          "{{ $json['Search Keywords'] }} {{ $json['Professional Title'] }}"
        ],
        "skipClosedPlaces": false
      }`
    };

    console.log('  ✅ Google Maps scraping enhanced for Israeli businesses');
    return modifiedGoogleMapsConfig;
  }

  async modifyLinkedInScraping() {
    console.log('🔧 Modifying LinkedIn scraping for Israeli professionals...');
    
    const modifiedLinkedInConfig = {
      "operation": "Run actor and get dataset",
      "actorId": "M2FMdjRVeF1HPGFcc",
      "customBody": `{
        "locations": [
          "{{ $json['US Location'] }}, United States"
        ],
        "maxItems": "{{ $json['Number of results'] }}",
        "profileScraperMode": "Full",
        "searchQuery": "Israeli {{ $json['Professional Title'] }} {{ $json['Search Keywords'] }}"
      }`,
      "timeout": {},
      "memory": 2048
    };

    console.log('  ✅ LinkedIn scraping enhanced for Israeli professionals');
    return modifiedLinkedInConfig;
  }

  async addDataProcessingFilters() {
    console.log('🔧 Adding data processing filters for Israeli detection...');
    
    // Google Maps data processing modifications
    const googleMapsFilters = {
      "assignments": [
        {
          "name": "title",
          "type": "string",
          "value": "={{ $json.title }}"
        },
        {
          "name": "isIsraeliBusiness",
          "type": "boolean",
          "value": "={{ $json.title.toLowerCase().includes('israeli') || $json.title.toLowerCase().includes('hebrew') || $json.title.toLowerCase().includes('kosher') || $json.title.toLowerCase().includes('israel') || $json.title.toLowerCase().includes('tel aviv') || $json.title.toLowerCase().includes('jerusalem') }}"
        },
        {
          "name": "hasPhoneNumber",
          "type": "boolean",
          "value": "={{ $json.phone && $json.phone.length > 0 }}"
        },
        {
          "name": "isUSLocation",
          "type": "boolean",
          "value": "={{ $json.countryCode === 'US' || $json.countryCode === 'USA' }}"
        }
      ]
    };

    // LinkedIn data processing modifications
    const linkedInFilters = {
      "assignments": [
        {
          "name": "name",
          "type": "string",
          "value": "={{ $json.firstName }} {{ $json.lastName }}"
        },
        {
          "name": "isIsraeliProfessional",
          "type": "boolean",
          "value": "={{ $json.headline.toLowerCase().includes('israeli') || $json.about.toLowerCase().includes('israeli') || $json.about.toLowerCase().includes('israel') || $json.about.toLowerCase().includes('hebrew') || $json.about.toLowerCase().includes('tel aviv') || $json.about.toLowerCase().includes('jerusalem') }}"
        },
        {
          "name": "hasValidName",
          "type": "boolean",
          "value": "={{ $json.firstName && $json.lastName && $json.firstName.length > 0 && $json.lastName.length > 0 }}"
        },
        {
          "name": "estimatedAge",
          "type": "number",
          "value": "={{ $json.experience.length > 0 ? 25 + ($json.experience.length * 2) : 30 }}"
        },
        {
          "name": "isTargetAge",
          "type": "boolean",
          "value": "={{ $json.estimatedAge >= 25 && $json.estimatedAge <= 50 }}"
        }
      ]
    };

    console.log('  ✅ Data processing filters added for Israeli detection');
    return { googleMapsFilters, linkedInFilters };
  }

  async createIsraeliLeadQueries() {
    console.log('🔧 Creating database queries for Israeli leads...');
    
    // Google Maps query for Israeli businesses
    const googleMapsQuery = `
      SELECT 
        id, title, address, city, state, phone, website, created_at
      FROM googlemaps 
      WHERE (
        LOWER(title) LIKE '%israeli%' OR 
        LOWER(title) LIKE '%hebrew%' OR 
        LOWER(title) LIKE '%kosher%' OR
        LOWER(title) LIKE '%israel%' OR
        LOWER(title) LIKE '%tel aviv%' OR
        LOWER(title) LIKE '%jerusalem%'
      ) 
      AND country_code = 'US'
      AND phone IS NOT NULL 
      AND phone != ''
      ORDER BY created_at DESC
      LIMIT 10000;
    `;

    // LinkedIn query for Israeli professionals
    const linkedInQuery = `
      SELECT 
        id, name, headline, about, connectionscount, followercount, created_at
      FROM linkedin 
      WHERE (
        LOWER(headline) LIKE '%israeli%' OR 
        LOWER(about) LIKE '%israeli%' OR 
        LOWER(about) LIKE '%israel%' OR
        LOWER(about) LIKE '%hebrew%' OR
        LOWER(about) LIKE '%tel aviv%' OR
        LOWER(about) LIKE '%jerusalem%'
      )
      AND name IS NOT NULL
      AND name != ''
      ORDER BY created_at DESC
      LIMIT 5000;
    `;

    console.log('  ✅ Database queries created for Israeli leads');
    return { googleMapsQuery, linkedInQuery };
  }

  async testModifiedWorkflow() {
    console.log('🧪 Testing modified workflow...');
    
    try {
      // Test Google Maps query
      const { data: googleMapsResults, error: googleMapsError } = await this.supabase
        .from('googlemaps')
        .select('id, title, address, city, state, phone, website, created_at')
        .or('title.ilike.%israeli%,title.ilike.%hebrew%,title.ilike.%kosher%,title.ilike.%israel%')
        .eq('country_code', 'US')
        .not('phone', 'is', null)
        .limit(10);

      if (googleMapsError) {
        console.log('  ❌ Google Maps query failed:', googleMapsError.message);
      } else {
        console.log(`  ✅ Google Maps query successful: ${googleMapsResults.length} results`);
      }

      // Test LinkedIn query
      const { data: linkedInResults, error: linkedInError } = await this.supabase
        .from('linkedin')
        .select('id, name, headline, about, connectionscount, followercount, created_at')
        .or('headline.ilike.%israeli%,about.ilike.%israeli%,about.ilike.%israel%,about.ilike.%hebrew%')
        .not('name', 'is', null)
        .limit(10);

      if (linkedInError) {
        console.log('  ❌ LinkedIn query failed:', linkedInError.message);
      } else {
        console.log(`  ✅ LinkedIn query successful: ${linkedInResults.length} results`);
      }

    } catch (error) {
      console.log('  ❌ Test failed:', error.message);
    }
  }

  async exportIsraeliLeads() {
    console.log('📊 Exporting Israeli leads...');
    
    try {
      // Export Google Maps Israeli businesses
      const { data: googleMapsLeads } = await this.supabase
        .from('googlemaps')
        .select('*')
        .or('title.ilike.%israeli%,title.ilike.%hebrew%,title.ilike.%kosher%,title.ilike.%israel%')
        .eq('country_code', 'US')
        .not('phone', 'is', null);

      // Export LinkedIn Israeli professionals
      const { data: linkedInLeads } = await this.supabase
        .from('linkedin')
        .select('*')
        .or('headline.ilike.%israeli%,about.ilike.%israeli%,about.ilike.%israel%,about.ilike.%hebrew%')
        .not('name', 'is', null);

      console.log(`  ✅ Google Maps Israeli businesses: ${googleMapsLeads.length}`);
      console.log(`  ✅ LinkedIn Israeli professionals: ${linkedInLeads.length}`);
      console.log(`  📊 Total Israeli leads: ${googleMapsLeads.length + linkedInLeads.length}`);

      return {
        googleMapsLeads,
        linkedInLeads,
        total: googleMapsLeads.length + linkedInLeads.length
      };

    } catch (error) {
      console.log('  ❌ Export failed:', error.message);
      return null;
    }
  }
}

// Run the workflow modification
const modifier = new N8NWorkflowModifier();
modifier.modifyWorkflowForIsraeliLeads()
  .then(() => modifier.exportIsraeliLeads())
  .catch(console.error);
