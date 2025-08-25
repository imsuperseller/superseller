# Shelly Mizrahi - Make.com Integration

## Overview
Shelly's workflow has been completely restructured from n8n to Make.com with native Surense integration.

## New Architecture

### Make.com Scenario Flow
1. ** Manual Trigger ** - Client ID and Family Member IDs input
2. ** AI Research Agent ** - OpenAI - powered family research
3. ** Document Generator ** - Professional family profile creation
4. ** Surense Lead Creator ** - Automatic lead creation in Surense
5. ** Document Upload ** - Profile document uploaded to Surense
6. ** Customer Portal Update ** - Real - time portal updates

### API Configuration
                - ** Make.com API Key:** 7cca707a - 9429 - 4997 - 8ba9 - fc67fc7e4b29
                - ** Base URL:** https://us2.make.com/api/v2
- ** Permissions:** Full access to all Make.com features

### Surense Integration
                - ** Native Module:** Available in Make.com
                - ** Endpoints:** Customers, Leads, Documents, Meetings, Reports
                - ** Authentication:** Bearer token via Make.com

## Usage

### Starting Family Research
1. Access customer portal: https://shelly.rensto.com
                    2. Enter Client ID and Family Member IDs
3. Select research depth(basic / comprehensive / deep)
4. Submit request
5. Monitor progress in real - time

### Output
                - Comprehensive family profile document
                - Surense lead with all research data
                    - Uploaded document in Surense system
                        - Real - time portal updates

## Benefits
                    - ** Native Integration:** Direct Surense module access
- ** AI - Powered Research:** Advanced family analysis
                    - ** Professional Documents:** Automated profile generation
                        - ** Real - time Updates:** Live portal monitoring
                            - ** Scalable Architecture:** Easy to extend and modify

## Migration Notes
                    - Old n8n workflows have been removed
                        - All data migrated to Make.com
                            - Customer portal updated for new workflow
                                - API endpoints created for Make.com integration
                                    