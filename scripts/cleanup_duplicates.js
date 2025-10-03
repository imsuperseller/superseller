import { Client } from '@notionhq/client';

async function cleanupDuplicates() {
  try {
    console.log('🧹 CLEANING UP DUPLICATES...');
    console.log('='.repeat(60));
    
    const notion = new Client({
      auth: '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',
      notionVersion: '2025-09-03'
    });
    
    const businessOperationsDbId = '553892df-d665-42cb-a3c6-d68f55fe02fd';
    
    console.log('\n📊 CLEANING UP BUSINESS OPERATIONS DUPLICATES...');
    
    const businessOpsDb = await notion.databases.retrieve({
      database_id: businessOperationsDbId
    });
    
    const businessOpsDataSourceId = businessOpsDb.data_sources[0].id;
    const businessOpsRecords = await notion.dataSources.query({
      data_source_id: businessOpsDataSourceId
    });
    
    console.log(`Found ${businessOpsRecords.results.length} records`);
    
    // Group records by name to find duplicates
    const recordsByName = {};
    
    businessOpsRecords.results.forEach(record => {
      const name = record.properties?.Name?.title?.[0]?.text?.content || 'No name';
      if (!recordsByName[name]) {
        recordsByName[name] = [];
      }
      recordsByName[name].push(record);
    });
    
    // Find and remove duplicates (keep the first one, remove the rest)
    let duplicatesRemoved = 0;
    
    Object.entries(recordsByName).forEach(([name, records]) => {
      if (records.length > 1) {
        console.log(`\n🔄 Found ${records.length} duplicates for: ${name}`);
        
        // Keep the first record, remove the rest
        for (let i = 1; i < records.length; i++) {
          try {
            notion.pages.update({
              page_id: records[i].id,
              archived: true
            });
            console.log(`   ✅ Removed duplicate: ${records[i].id}`);
            duplicatesRemoved++;
          } catch (error) {
            console.log(`   ❌ Error removing duplicate: ${error.message}`);
          }
        }
      }
    });
    
    console.log(`\n🎉 CLEANUP COMPLETE!`);
    console.log(`✅ Removed ${duplicatesRemoved} duplicate records`);
    
    // Final count
    const finalRecords = await notion.dataSources.query({
      data_source_id: businessOpsDataSourceId
    });
    
    console.log(`✅ Final record count: ${finalRecords.results.length}`);
    
    console.log('\n📋 FINAL RECORDS:');
    finalRecords.results.forEach((record, index) => {
      const name = record.properties?.Name?.title?.[0]?.text?.content || 'No name';
      console.log(`   ${index + 1}. ${name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the cleanup
cleanupDuplicates();
