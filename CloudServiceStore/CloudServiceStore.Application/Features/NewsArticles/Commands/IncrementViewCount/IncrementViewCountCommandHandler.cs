using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.IncrementViewCount;

public class IncrementViewCountCommandHandler : IRequestHandler<IncrementViewCountCommand, bool>
{
    private readonly IRepository<NewsArticle> _newsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public IncrementViewCountCommandHandler(IRepository<NewsArticle> newsRepository, IUnitOfWork unitOfWork)
    {
        _newsRepository = newsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(IncrementViewCountCommand request, CancellationToken cancellationToken)
    {
        var article = await _newsRepository.GetByIdAsync(request.Id);
        if (article == null)
            return false;

        article.IncrementViewCount();

        _newsRepository.Update(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
