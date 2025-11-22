"""
PDF Generation Service
Uses WeasyPrint for HTML to PDF conversion.
"""
import os
import tempfile
from pathlib import Path
from typing import Optional, Union
import logging

logger = logging.getLogger(__name__)


class PDFGenerationError(Exception):
    """Custom exception for PDF generation failures"""
    pass


class PDFGenerator:
    """
    PDF Generator using WeasyPrint.
    
    WeasyPrint is a pure Python solution that doesn't require
    external system dependencies like wkhtmltopdf.
    """
    
    def __init__(self):
        self.weasyprint_available = self._check_weasyprint()
        
        if not self.weasyprint_available:
            raise PDFGenerationError(
                "WeasyPrint is not available. Install with: pip install weasyprint"
            )
    
    def _check_weasyprint(self) -> bool:
        """Check if WeasyPrint is available"""
        try:
            import weasyprint
            return True
        except ImportError:
            logger.error("WeasyPrint not available")
            return False
    
    def generate_pdf(
        self,
        html_content: str,
        filename: Union[str, Path]
    ) -> str:
        """
        Generate PDF from HTML content using WeasyPrint.
        
        Args:
            html_content: HTML string to convert
            filename: Output filename/path
        
        Returns:
            Path to generated PDF file
        
        Raises:
            PDFGenerationError: If PDF generation fails
        """
        filename = Path(filename)
        
        # Ensure directory exists
        filename.parent.mkdir(parents=True, exist_ok=True)
        
        return self._generate_with_weasyprint(html_content, filename)
    
    def _generate_with_weasyprint(self, html_content: str, filename: Path) -> str:
        """
        Generate PDF using WeasyPrint.
        
        Pure Python solution, easier to install but may have different rendering.
        """
        from weasyprint import HTML, CSS
        
        # Add custom CSS for better print output with proper page breaks
        custom_css = CSS(string='''
            @page {
                size: A4;
                margin: 0.75in;
            }
            
            body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
            }
            
            /* Prevent sections from splitting across pages */
            h2 {
                page-break-after: avoid;
                page-break-inside: avoid;
            }
            
            .job,
            .education-item,
            .project,
            .certification-item {
                page-break-inside: avoid;
                orphans: 3;
                widows: 3;
            }
            
            .skills {
                page-break-inside: avoid;
            }
            
            /* Ensure at least some content stays with heading */
            h2 + p,
            h2 + div {
                page-break-before: avoid;
            }
            
            /* Improve spacing around page breaks */
            hr {
                page-break-after: avoid;
            }
            
            .summary {
                page-break-inside: avoid;
            }
            
            /* Fine-tune orphans and widows for better text flow */
            p {
                orphans: 3;
                widows: 3;
            }
            
            ul {
                page-break-inside: avoid;
            }
            
            @media print {
                .no-print { display: none; }
            }
        ''')
        
        try:
            html_obj = HTML(string=html_content)
            html_obj.write_pdf(str(filename), stylesheets=[custom_css])
            logger.info(f"PDF generated with WeasyPrint: {filename}")
            return str(filename)
        except Exception as e:
            raise PDFGenerationError(f"WeasyPrint generation failed: {e}")
    
    def generate_pdf_from_file(
        self,
        html_file: Union[str, Path],
        output_file: Union[str, Path]
    ) -> str:
        """
        Generate PDF from HTML file.
        
        Args:
            html_file: Path to HTML file
            output_file: Output PDF path
        
        Returns:
            Path to generated PDF
        """
        html_file = Path(html_file)
        
        if not html_file.exists():
            raise FileNotFoundError(f"HTML file not found: {html_file}")
        
        html_content = html_file.read_text(encoding='utf-8')
        return self.generate_pdf(html_content, output_file)


# Convenience function for simple use cases
def generate_pdf(
    html_content: str,
    filename: Union[str, Path]
) -> str:
    """
    Simple function to generate PDF from HTML content.
    
    Args:
        html_content: HTML string to convert
        filename: Output filename
    
    Returns:
        Path to generated PDF file
    
    Example:
        >>> html = "<html><body><h1>My CV</h1></body></html>"
        >>> pdf_path = generate_pdf(html, "output.pdf")
        >>> print(f"PDF saved to: {pdf_path}")
    """
    generator = PDFGenerator()
    return generator.generate_pdf(html_content, filename)


def generate_pdf_from_file(
    html_file: Union[str, Path],
    output_file: Union[str, Path]
) -> str:
    """
    Simple function to generate PDF from HTML file.
    
    Args:
        html_file: Path to HTML file
        output_file: Output PDF path
    
    Returns:
        Path to generated PDF file
    
    Example:
        >>> pdf_path = generate_pdf_from_file("cv.html", "cv.pdf")
    """
    generator = PDFGenerator()
    return generator.generate_pdf_from_file(html_file, output_file)


# Check system status
def check_pdf_capabilities() -> dict:
    """
    Check which PDF generation methods are available.
    
    Returns:
        Dictionary with capability information
    """
    try:
        generator = PDFGenerator()
        return {
            "available": True,
            "backend": "weasyprint",
            "weasyprint": generator.weasyprint_available
        }
    except PDFGenerationError:
        return {
            "available": False,
            "backend": None,
            "weasyprint": False,
            "error": "WeasyPrint is not available"
        }


if __name__ == "__main__":
    """Test PDF generation"""
    import sys
    
    # Check capabilities
    capabilities = check_pdf_capabilities()
    print("PDF Generation Capabilities:")
    print(f"  Available: {capabilities['available']}")
    print(f"  Backend: {capabilities.get('backend', 'None')}")
    print(f"  WeasyPrint: {capabilities['weasyprint']}")
    
    if not capabilities['available']:
        print("\n❌ No PDF generation backend available!")
        print("Install WeasyPrint: pip install weasyprint")
        sys.exit(1)
    
    # Test generation
    print("\n Testing PDF generation...")
    test_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Test CV</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 { color: #2c3e50; }
            .section { margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>John Doe</h1>
        <p><strong>Email:</strong> john.doe@example.com</p>
        <p><strong>Phone:</strong> +1-555-0123</p>
        
        <div class="section">
            <h2>Professional Summary</h2>
            <p>Experienced software engineer with 5+ years of expertise in full-stack development.</p>
        </div>
        
        <div class="section">
            <h2>Work Experience</h2>
            <h3>Senior Developer at Tech Corp</h3>
            <p><em>2021 - Present</em></p>
            <ul>
                <li>Led development of microservices architecture</li>
                <li>Improved system performance by 40%</li>
                <li>Mentored junior developers</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>Skills</h2>
            <p>Python, JavaScript, React, Node.js, PostgreSQL, Docker, AWS</p>
        </div>
    </body>
    </html>
    """
    
    try:
        output_path = "test_cv.pdf"
        result = generate_pdf(test_html, output_path)
        print(f"✅ PDF generated successfully: {result}")
        
        # Check file size
        file_size = os.path.getsize(result)
        print(f"   File size: {file_size:,} bytes")
        
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        sys.exit(1)
