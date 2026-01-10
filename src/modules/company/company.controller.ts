import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Body, 
  Req, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  UnauthorizedException
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('company')
@Controller('company')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get company profile' })
  @ApiResponse({ status: 200, description: 'Company profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyProfile(@Param('id') id: string, @Req() req) {
    if(id !== req.companyId){
        return "unauthorized"
    }
    let profile = await this.companyService.getCompanyById(id);
    return ResponseUtil.success(
      'company profile data',
       profile
    )
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update company profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async updateCompanyProfile(@Param('id') id: string,@Req() req, @Body() updateCompanyDto: UpdateCompanyDto) {
    if(id !== req.companyId){
        return "unauthorized"
    }
    let result = await this.companyService.updateCompany(id, updateCompanyDto);
    return ResponseUtil.created(
      'updated successfully',
      result
    )
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete company profile' })
  @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async deleteCompanyProfile(@Param('id') id: string, @Req() req) {
    if(id !== req.companyId){
        return "unauthorized"
    }
    let result = await this.companyService.deleteCompany(id);
    return ResponseUtil.noContent('profile deleted')
  }
}