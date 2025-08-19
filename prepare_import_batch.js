const fs = require('fs');

// Create larger batches for bulk import
function prepareLargeBatch(startIndex = 0, batchSize = 50) {
  try {
    // Read the JSONL file
    const content = fs.readFileSync('./articles/documents.jsonl', 'utf8');
    const lines = content.trim().split('\n');
    
    console.log(`📚 Total articles available: ${lines.length}`);
    console.log(`📦 Preparing batch starting at index ${startIndex}, size ${batchSize}`);
    
    // Take the specified range
    const batchLines = lines.slice(startIndex, startIndex + batchSize);
    
    if (batchLines.length === 0) {
      console.log('✅ No more articles to process - all done!');
      return null;
    }
    
    console.log(`🔄 Processing ${batchLines.length} articles`);
    
    // Parse each line and create array
    const articles = [];
    let parseErrors = 0;
    
    for (let i = 0; i < batchLines.length; i++) {
      try {
        const article = JSON.parse(batchLines[i]);
        articles.push(article);
        
        // Only log first few and last few to avoid spam
        if (i < 3 || i >= batchLines.length - 3) {
          console.log(`${startIndex + i + 1}. ${article.title}`);
        } else if (i === 3) {
          console.log('   ... (showing first 3 and last 3) ...');
        }
      } catch (error) {
        parseErrors++;
        console.error(`❌ Failed to parse line ${startIndex + i + 1}:`, error.message);
      }
    }
    
    if (parseErrors > 0) {
      console.warn(`⚠️  ${parseErrors} lines failed to parse`);
    }
    
    // Write as JSON array
    const outputFile = `./batch_${Math.floor(startIndex / batchSize) + 1}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));
    
    console.log(`\n✅ Batch prepared: ${articles.length} articles written to ${outputFile}`);
    console.log(`📊 Progress: ${startIndex + batchLines.length}/${lines.length} articles (${Math.round((startIndex + batchLines.length) / lines.length * 100)}%)`);
    
    const nextIndex = startIndex + batchSize;
    const hasMore = nextIndex < lines.length;
    
    if (hasMore) {
      console.log(`\n🔜 Next batch: run with startIndex=${nextIndex}`);
      console.log(`   Command: node prepare_large_batch.js ${nextIndex} ${batchSize}`);
    } else {
      console.log(`\n🎉 All articles processed!`);
    }
    
    console.log(`\n📋 Import instructions:`);
    console.log(`1. Copy content of ${outputFile}`);
    console.log(`2. Go to Convex dashboard`);
    console.log(`3. Run 'import_articles:importArticlesBatch' function`);
    console.log(`4. Use batchIndex: ${Math.floor(startIndex / batchSize)}`);
    console.log(`5. Monitor logs for success/errors`);
    
    return {
      outputFile,
      articlesCount: articles.length,
      hasMore,
      nextIndex: hasMore ? nextIndex : null,
      progress: `${startIndex + batchLines.length}/${lines.length}`
    };
  } catch (error) {
    console.error('❌ Error preparing batch:', error);
    return null;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const startIndex = parseInt(args[0]) || 0;
const batchSize = parseInt(args[1]) || 50;

console.log('🚀 Preparing large article batch for RAG import...\n');
prepareLargeBatch(startIndex, batchSize);