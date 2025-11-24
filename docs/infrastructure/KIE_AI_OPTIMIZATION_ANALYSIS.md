# Kie.ai Video Generation Optimization Analysis

**Date**: November 24, 2025  
**Issue**: Video generation taking 13 minutes instead of expected 2-3 minutes  
**Root Cause**: Likely queue wait time, not actual processing time

---

## Problem Analysis

### Current Situation
- **Expected**: 2-3 minutes processing time
- **Actual**: 13 minutes (784 seconds) total time
- **API Response**: No `startTime` field to distinguish queue vs processing

### Key Finding
The `costTime: 784` seconds represents **total time from job creation to completion**, which includes:
1. **Queue wait time** (likely 10+ minutes)
2. **Actual processing time** (likely 2-3 minutes)

---

## Research Findings

### Common Causes of Slow Processing
1. **Server Load & Queue Times**: High demand leads to jobs waiting in queue
2. **High Resolution Settings**: `size: "high"` requires more resources
3. **Frame Count**: `n_frames: 10` may be higher than necessary
4. **Peak Usage Times**: Processing during high-traffic periods

### Industry Best Practices
- Most video APIs have queue systems that prioritize based on:
  - Account tier/credits
  - Job complexity
  - Server load
  - Time of day

---

## Optimization Solutions

### Solution 1: Use Non-Pro Model (MAJOR FINDING)
**Current**: `sora-2-pro-text-to-video`  
**Alternative**: `sora-2-text-to-video` (non-pro)

**Discovery**: 
- ✅ `sora-2-text-to-video` model exists and accepts same parameters
- ⚠️ Non-pro models typically have shorter queue times
- ⚠️ May have slightly lower quality but faster processing
- **Action**: Test if non-pro model has shorter queue times

### Solution 2: Valid Parameter Constraints (CRITICAL)
**Findings from API Testing**:
- ❌ `n_frames` **MUST be 10** (minimum allowed, cannot reduce)
- ✅ `size` can be `"high"` or `"standard"` (NOT "medium" or "low")
- ❌ Previous optimization attempt to reduce frames was invalid

**Current Valid Parameters**:
```json
{
  "model": "sora-2-pro-text-to-video",  // or "sora-2-text-to-video"
  "input": {
    "prompt": "...",
    "aspect_ratio": "landscape",
    "n_frames": "10",  // REQUIRED - cannot be reduced
    "size": "high",    // or "standard" (not "medium")
    "remove_watermark": true
  }
}
```

### Solution 3: Test Size Parameter
**Current**: `size: "high"`  
**Alternative**: `size: "standard"`

**Impact**:
- May reduce queue time (less resource-intensive)
- May reduce processing time
- Quality difference unknown - needs testing

### Solution 4: Monitor Queue vs Processing Time
**Action**: Track multiple requests to identify patterns
- If consistent 13 minutes → Queue issue
- If variable → Server load dependent

### Solution 5: Optimize Request Timing
**Action**: Test during different times of day
- Off-peak hours may have shorter queues
- Peak hours (US business hours) likely have longer waits

### Solution 6: Check for Priority Parameters
**Action**: Review Kie.ai API documentation for:
- Priority flags
- Queue position endpoints
- Account tier benefits

### Solution 7: Alternative Model Options
**Option A: Non-Pro Model (Potentially Faster Queue)**
```json
{
  "model": "sora-2-text-to-video",  // Non-pro version
  "input": {
    "prompt": "...",
    "aspect_ratio": "landscape",
    "n_frames": "10",
    "size": "high",
    "remove_watermark": true
  }
}
```

**Option B: Standard Size (Potentially Faster)**
```json
{
  "model": "sora-2-pro-text-to-video",
  "input": {
    "prompt": "...",
    "aspect_ratio": "landscape",
    "n_frames": "10",
    "size": "standard",  // Instead of "high"
    "remove_watermark": true
  }
}
```

**Option C: Non-Pro + Standard (Fastest Queue)**
```json
{
  "model": "sora-2-text-to-video",
  "input": {
    "prompt": "...",
    "aspect_ratio": "landscape",
    "n_frames": "10",
    "size": "standard",
    "remove_watermark": true
  }
}
```

---

## Immediate Action Plan

1. ✅ **Test `sora-2-text-to-video` (non-pro)** - May have shorter queue times
2. ✅ **Test `size: "standard"`** - May reduce queue/processing time
3. ⏳ **Add logging** to track createTime vs completion patterns
4. ⏳ **Test multiple requests** at different times to identify queue patterns
5. ⏳ **Compare models**: Test pro vs non-pro queue times side-by-side
6. ⏳ **Compare sizes**: Test high vs standard queue times side-by-side

---

## Monitoring & Metrics

### Track These Metrics
- `createTime`: When job was created
- `completeTime`: When job finished
- `costTime`: Total time (queue + processing)
- **Missing**: `startTime` (when processing actually began)

### Expected Outcomes
- **Best Case**: Queue time reduces to <1 minute, total time 3-4 minutes
- **Realistic**: Queue time 5-7 minutes, total time 7-10 minutes
- **Worst Case**: Queue time remains 10+ minutes (server capacity issue)

---

## Next Steps

1. ❌ ~~Implement `n_frames: 8` optimization~~ (INVALID - minimum is 10)
2. ✅ **Test `sora-2-text-to-video` (non-pro model)** - Priority test
3. ✅ **Test `size: "standard"`** - May reduce queue time
4. ⏳ Add queue time tracking (if API supports it)
5. ⏳ Test during off-peak hours
6. ⏳ Compare all 4 combinations:
   - Pro + High
   - Pro + Standard
   - Non-Pro + High
   - Non-Pro + Standard
7. ⏳ Consider alternative: Pre-generate videos for common prompts

---

**Status**: Analysis complete, optimization in progress

